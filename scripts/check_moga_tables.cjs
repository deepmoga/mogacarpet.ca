const { Client } = require('ssh2');

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

conn.on('ready', async () => {
  try {
    const res = await run('mariadb -u root -p"Official@12345" -e "USE mogacarpet; SHOW TABLES;"');
    console.log('[MOGACARPET TABLES]:\n', res.out);
  } catch (err) {
    console.error(err);
  } finally {
    conn.end();
  }
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
});
