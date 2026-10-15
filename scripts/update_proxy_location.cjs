const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready');
  
  const vhostConf = `
<VirtualHost *:80>
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca
    ServerAlias mail.mogacarpet.ca
    ServerAlias webmail.mogacarpet.ca
    ServerAlias admin.mogacarpet.ca
    DocumentRoot /home/mogacarpet/public_html
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined

    ProxyPreserveHost On
    ProxyPass /.well-known !
    <Location />
        ProxyPass http://127.0.0.1:3050/
        ProxyPassReverse http://127.0.0.1:3050/
        Require all granted
    </Location>
</VirtualHost>

<VirtualHost *:443>
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca
    ServerAlias mail.mogacarpet.ca
    ServerAlias webmail.mogacarpet.ca
    ServerAlias admin.mogacarpet.ca
    DocumentRoot /home/mogacarpet/public_html
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined

    SSLEngine on
    SSLCertificateFile /etc/ssl/virtualmin/17122270712946276/ssl.cert
    SSLCertificateKeyFile /etc/ssl/virtualmin/17122270712946276/ssl.key
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1

    ProxyPreserveHost On
    ProxyPass /.well-known !
    <Location />
        ProxyPass http://127.0.0.1:3050/
        ProxyPassReverse http://127.0.0.1:3050/
        Require all granted
    </Location>
</VirtualHost>
`;

  // Write new config and test
  const cmd = `
    cat << 'EOF' > /etc/apache2/sites-available/mogacarpet.ca.conf
${vhostConf}
EOF
    apache2ctl configtest && systemctl reload apache2
    echo "=== HTTP Test ==="
    curl -I -H "Host: mogacarpet.ca" http://127.0.0.1/
    echo "=== HTTPS Test ==="
    curl -k -I --resolve mogacarpet.ca:443:127.0.0.1 https://mogacarpet.ca/
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      console.log('Finished updating vhost conf');
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
