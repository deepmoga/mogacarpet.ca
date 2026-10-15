const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

function run(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      let errStr = '';
      stream.on('close', (code) => {
        resolve({ code, out, err: errStr });
      }).on('data', (d) => {
        out += d.toString();
      }).stderr.on('data', (d) => {
        errStr += d.toString();
      });
    });
  });
}

function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      console.log(`Uploading ${localPath} -> ${remotePath}...`);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log(`Upload complete: ${remotePath}`);
        resolve();
      });
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
}

conn.on('ready', async () => {
  try {
    const dumpPath = path.resolve(__dirname, '..', 'mogacarpet_dump.sql');
    await uploadFile(dumpPath, '/tmp/mogacarpet_dump.sql');

    console.log('Importing SQL dump into MariaDB mogacarpet database...');
    const importRes = await run('mariadb -u mogacarpet -p"9MlpYifiWYottlW" mogacarpet < /tmp/mogacarpet_dump.sql');
    console.log('[IMPORT RESULT]: code =', importRes.code, importRes.err);

    console.log('Verifying imported tables and count...');
    const verifyRes = await run('mariadb -u mogacarpet -p"9MlpYifiWYottlW" mogacarpet -e "SELECT \'products\' AS tbl, COUNT(*) AS count FROM products UNION ALL SELECT \'categories\', COUNT(*) FROM categories UNION ALL SELECT \'settings\', COUNT(*) FROM settings;"');
    console.log('[VERIFY RESULT]:\n', verifyRes.out);

  } catch (err) {
    console.error('Database deployment error:', err);
  } finally {
    conn.end();
  }
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
});
