const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- Test 1: Local port 3050 direct ---"
    curl -I http://127.0.0.1:3050/ | head -n 10
    echo "--- Test 2: Apache port 80 proxy ---"
    curl -I -H "Host: mogacarpet.ca" http://127.0.0.1/ | head -n 10
    echo "--- Test 3: Apache port 443 proxy ---"
    curl -k -I --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/ | head -n 10
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('Finished with code:', code);
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
