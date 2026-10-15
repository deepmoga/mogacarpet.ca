const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready');
  
  const vhost = `<VirtualHost *:80>
    SuexecUserGroup #1041 #1041
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca
    ServerAlias mail.mogacarpet.ca
    ServerAlias webmail.mogacarpet.ca
    ServerAlias admin.mogacarpet.ca
    DocumentRoot /home/mogacarpet/public_html
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined
    ScriptAlias /cgi-bin/ /home/mogacarpet/cgi-bin/
    ScriptAlias /awstats /home/mogacarpet/cgi-bin/awstats.pl
    DirectoryIndex index.php index.htm index.html
    <Directory /home/mogacarpet/public_html>
        Options -Indexes +IncludesNOEXEC +SymLinksIfOwnerMatch +ExecCGI
        Require all granted
        AllowOverride All Options=ExecCGI,Includes,IncludesNOEXEC,Indexes,MultiViews,SymLinksIfOwnerMatch
    </Directory>
    <Directory /home/mogacarpet/cgi-bin>
        Require all granted
        AllowOverride All Options=ExecCGI,Includes,IncludesNOEXEC,Indexes,MultiViews,SymLinksIfOwnerMatch
    </Directory>
    ProxyPass /.well-known !
    RewriteEngine on
    RewriteCond %{HTTP_HOST} =webmail.mogacarpet.ca
    RewriteRule ^/(?!\\.well-known)(.*)$ https://mogacarpet.ca:20000/ [R=301,L]
    RewriteCond %{HTTP_HOST} =admin.mogacarpet.ca
    RewriteRule ^/(?!\\.well-known)(.*)$ https://mogacarpet.ca:10000/ [R=301,L]
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://localhost:3050/
    ProxyPassReverse / http://localhost:3050/
</VirtualHost>
<VirtualHost *:443>
    SuexecUserGroup #1041 #1041
    ServerName mogacarpet.ca
    ServerAlias www.mogacarpet.ca
    ServerAlias mail.mogacarpet.ca
    ServerAlias webmail.mogacarpet.ca
    ServerAlias admin.mogacarpet.ca
    DocumentRoot /home/mogacarpet/public_html
    ErrorLog /var/log/virtualmin/mogacarpet.ca_error_log
    CustomLog /var/log/virtualmin/mogacarpet.ca_access_log combined
    ScriptAlias /cgi-bin/ /home/mogacarpet/cgi-bin/
    ScriptAlias /awstats /home/mogacarpet/cgi-bin/awstats.pl
    DirectoryIndex index.php index.htm index.html
    <Directory /home/mogacarpet/public_html>
        Options -Indexes +IncludesNOEXEC +SymLinksIfOwnerMatch +ExecCGI
        Require all granted
        AllowOverride All Options=ExecCGI,Includes,IncludesNOEXEC,Indexes,MultiViews,SymLinksIfOwnerMatch
    </Directory>
    <Directory /home/mogacarpet/cgi-bin>
        Require all granted
        AllowOverride All Options=ExecCGI,Includes,IncludesNOEXEC,Indexes,MultiViews,SymLinksIfOwnerMatch
    </Directory>
    ProxyPass /.well-known !
    RewriteEngine on
    RewriteCond %{HTTP_HOST} =webmail.mogacarpet.ca
    RewriteRule ^/(?!\\.well-known)(.*)$ https://mogacarpet.ca:20000/ [R=301,L]
    RewriteCond %{HTTP_HOST} =admin.mogacarpet.ca
    RewriteRule ^/(?!\\.well-known)(.*)$ https://mogacarpet.ca:10000/ [R=301,L]
    SSLEngine on
    SSLCertificateFile /etc/ssl/virtualmin/17122270712946276/ssl.cert
    SSLCertificateKeyFile /etc/ssl/virtualmin/17122270712946276/ssl.key
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://localhost:3050/
    ProxyPassReverse / http://localhost:3050/
</VirtualHost>
`;

  const script = `
cat << 'EOF' > /etc/apache2/sites-available/mogacarpet.ca.conf
${vhost}
EOF
apache2ctl configtest && systemctl reload apache2
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
