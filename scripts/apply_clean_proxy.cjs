const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const conf = `<VirtualHost *:80>
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca

    ProxyPreserveHost On
    ProxyRequests Off

    ProxyPass /.well-known !
    ProxyPass / http://127.0.0.1:3050/
    ProxyPassReverse / http://127.0.0.1:3050/

    RequestHeader set X-Forwarded-Proto "http"
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca

    ProxyPreserveHost On
    ProxyRequests Off

    SSLEngine on
    SSLCertificateFile /etc/ssl/virtualmin/17122270712946276/ssl.cert
    SSLCertificateKeyFile /etc/ssl/virtualmin/17122270712946276/ssl.key
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1

    ProxyPass /.well-known !
    ProxyPass / http://127.0.0.1:3050/
    ProxyPassReverse / http://127.0.0.1:3050/

    RequestHeader set X-Forwarded-Proto "https"
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined
</VirtualHost>
`;

  const script = `
cat << 'EOF' > /etc/apache2/sites-available/mogacarpet.ca.conf
${conf}
EOF
apache2ctl configtest && systemctl reload apache2
sleep 1
echo "=== Testing Apache 80 ==="
curl -s -o /dev/null -w "Apache 80: %{http_code}\n" -H "Host: mogacarpet.ca" http://127.0.0.1/
echo "=== Testing Apache 443 ==="
curl -k -s -o /dev/null -w "Apache 443: %{http_code}\n" --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('Script finished with code:', code);
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
