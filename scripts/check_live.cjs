const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established');
  const cmd = `
    echo "=== LISTENING PORTS ==="
    ss -tlpn
    echo "=== FIREWALL STATUS ==="
    ufw status || iptables -L -n -v | head -n 30
    echo "=== TEST LOCAL HTTPS PROXY ==="
    curl -k -I https://127.0.0.1 -H "Host: mogacarpet.ca"
    echo "=== TEST LOCAL PORT 3000 ==="
    curl -I http://127.0.0.1:3000
    echo "=== PM2 STATUS ==="
    pm2 status
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
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
