const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    systemctl restart apache2
    sleep 2
    ss -tlpn | grep apache2
    echo "=== TEST 3050 ==="
    curl -s -o /dev/null -w "Port 3050: %{http_code}\n" http://127.0.0.1:3050/
    echo "=== TEST APACHE 80 ==="
    curl -s -o /dev/null -w "Apache 80: %{http_code}\n" -H "Host: mogacarpet.ca" http://127.0.0.1/
    echo "=== TEST APACHE 443 ==="
    curl -k -s -o /dev/null -w "Apache 443: %{http_code}\n" --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/
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
