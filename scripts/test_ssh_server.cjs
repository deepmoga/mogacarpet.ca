const { Client } = require('ssh2');

const conn = new Client();

console.log('Connecting to 62.84.184.96...');

conn.on('ready', () => {
  console.log('SSH Connection READY!');
  conn.exec('uname -a && whoami && (node -v || true) && (npm -v || true) && (which pm2 || true) && (nginx -v || true) && (mysql --version || true)', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', (code, signal) => {
      console.log('Command finished with exit code:', code);
      console.log('OUTPUT:\n' + out);
      conn.end();
    }).on('data', (data) => {
      out += data.toString();
    }).stderr.on('data', (data) => {
      out += '[STDERR] ' + data.toString();
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection ERROR:', err.message);
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
  readyTimeout: 30000,
});
