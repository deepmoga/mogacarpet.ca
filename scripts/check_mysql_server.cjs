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
    const cnf = await run('cat /etc/mysql/debian.cnf 2>/dev/null || cat /root/.my.cnf 2>/dev/null');
    console.log('[MYSQL CNF]:\n', cnf.out);

    const testRootPass = await run('mariadb -u root -pgDdsK5j9EGN8yyHlg1I12r1AD -e "SHOW DATABASES;" 2>&1');
    console.log('[TEST ROOT PASS]:\n', testRootPass.out);

    const vhostConf = await run('cat /etc/apache2/sites-available/mogacarpet.ca.conf');
    console.log('[VHOST CONF]:\n', vhostConf.out);

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
