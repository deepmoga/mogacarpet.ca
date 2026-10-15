const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('rm -f /home/mogacarpet/deploy.tar.gz', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Server deploy.tar.gz deleted');
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
