const mysql = require('mysql2/promise');
const { Client } = require('ssh2');

const TARGET_IDS = [
  'ancient-garden-classic',
  'ancient-garden-emerald',
  'ancient-garden-royal',
  'atlantic-city',
  'carpet-tiles-perspective',
  'commercial-tiles-basset',
  'commercial-tiles-bavarian',
  'fort-wood',
  'fun-and-games',
  'have-a-blast',
  'roll-the-dice',
  'space-explorer'
];

async function removeLocal() {
  console.log('--- Removing from Local MySQL ---');
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'mogacarpet'
    });

    const [beforeCount] = await conn.query('SELECT COUNT(*) as total FROM products;');
    console.log(`Local products before deletion: ${beforeCount[0].total}`);

    const [delRes] = await conn.query(
      `DELETE FROM products WHERE id IN (${TARGET_IDS.map(() => '?').join(', ')});`,
      TARGET_IDS
    );
    console.log(`Local deleted rows: ${delRes.affectedRows}`);

    const [afterCount] = await conn.query('SELECT COUNT(*) as total FROM products;');
    console.log(`Local products after deletion: ${afterCount[0].total}`);

    await conn.end();
  } catch (err) {
    console.error('Local MySQL error:', err.message);
  }
}

function removeRemote() {
  return new Promise((resolve, reject) => {
    console.log('\n--- Removing from Remote Server MySQL (62.84.184.96) ---');
    const conn = new Client();
    conn.on('ready', () => {
      const sqlList = TARGET_IDS.map(id => `'${id}'`).join(', ');
      const remoteCmd = `mysql -u mogacarpet -p9MlpYifiWYottlW mogacarpet -e "SELECT count(*) as count_before FROM products; DELETE FROM products WHERE id IN (${sqlList}); SELECT count(*) as count_after FROM products;"`;
      
      conn.exec(remoteCmd, (err, stream) => {
        if (err) return reject(err);
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.on('close', (code) => {
          console.log(out);
          conn.end();
          resolve();
        });
      });
    }).on('error', reject).connect({
      host: '62.84.184.96',
      port: 22,
      username: 'root',
      password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
    });
  });
}

async function main() {
  await removeLocal();
  await removeRemote();
  console.log('\nSuccessfully removed extra products from both Local & Remote databases!');
}

main().catch(console.error);
