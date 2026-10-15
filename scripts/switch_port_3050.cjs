const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection ready');
  const cmd = `
    sed -i 's/127.0.0.1:3000/127.0.0.1:3050/g' /etc/apache2/sites-available/mogacarpet.ca.conf
    apache2ctl configtest && systemctl reload apache2
    pm2 delete mogacarpet || true
    cd /home/mogacarpet/app && pm2 start npm --name "mogacarpet" -- start -- -p 3050
    pm2 save
    sleep 3
    curl -I http://127.0.0.1:3050
    curl -k -I https://127.0.0.1 -H "Host: mogacarpet.ca"
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      console.log('Done updating port to 3050');
      conn.end();
    });
  });
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD'
});
