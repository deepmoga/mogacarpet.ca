const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "=== Apache 80 Headers ==="
    curl -I -H "Host: mogacarpet.ca" http://127.0.0.1/
    echo "=== Apache 443 Headers ==="
    curl -k -I --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/
    echo "=== Which VirtualHosts match mogacarpet.ca? ==="
    apache2ctl -S | grep -E "mogacarpet|3050|default"
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
