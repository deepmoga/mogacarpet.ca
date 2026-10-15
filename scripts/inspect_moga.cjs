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
    const homeMoga = await run('ls -la /home/mogacarpet/');
    console.log('[HOME MOGACARPET]:\n', homeMoga.out);

    const pubHtml = await run('ls -la /home/mogacarpet/public_html/');
    console.log('[PUBLIC_HTML]:\n', pubHtml.out);

    const webServer = await run('systemctl is-active apache2; systemctl is-active nginx; which apache2');
    console.log('[WEBSERVER STATUS]:\n', webServer.out, webServer.err);

    const vhost = await run('grep -rn "mogacarpet" /etc/apache2/ /etc/nginx/ 2>/dev/null');
    console.log('[VHOST GREP]:\n', vhost.out);

    const mysqlCheck = await run('mariadb -e "SHOW DATABASES LIKE \'%moga%\';"');
    console.log('[MOGA DATABASES]:\n', mysqlCheck.out, mysqlCheck.err);

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
