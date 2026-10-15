const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    cp /etc/apache2/sites-available/mogacarpet.ca.conf /etc/apache2/sites-enabled/mogacarpet.ca.conf
    apache2ctl configtest && systemctl reload apache2
    sleep 1
    echo "=== Test Port 80 Proxy ==="
    curl -I -H "Host: mogacarpet.ca" http://127.0.0.1/ | head -n 12
    echo "=== Test Port 443 Proxy ==="
    curl -k -I --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/ | head -n 12
  `;
  conn.exec(script, (err, stream) => {
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
