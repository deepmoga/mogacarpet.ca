const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const routes = [
    '/',
    '/category/carpets',
    '/mogacarpetaccess',
    '/admin',
    '/estimator',
    '/products',
    '/api/categories'
  ];
  
  let cmd = '';
  for (const r of routes) {
    cmd += `echo -n "${r} -> "; curl -k -s -o /dev/null -w "%{http_code}\n" --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca${r}; `;
  }

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
