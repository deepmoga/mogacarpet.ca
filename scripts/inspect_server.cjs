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
  console.log('--- SERVER INSPECTION ---');
  try {
    const pm2List = await run('pm2 list');
    console.log('[PM2 LIST]:\n', pm2List.out);

    const nginxSites = await run('ls -la /etc/nginx/sites-enabled/ && ls -la /etc/nginx/conf.d/');
    console.log('[NGINX CONFIGS]:\n', nginxSites.out);

    const wwwDirs = await run('ls -la /var/www/ && (ls -la /home/ || true)');
    console.log('[DIRECTORIES]:\n', wwwDirs.out);

    const dbs = await run('mariadb -u root -e "SHOW DATABASES;" || mysql -u root -e "SHOW DATABASES;"');
    console.log('[DATABASES]:\n', dbs.out);

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    conn.end();
  }
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
});
