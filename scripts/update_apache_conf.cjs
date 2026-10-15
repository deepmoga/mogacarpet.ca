const { Client } = require('ssh2');

const conn = new Client();

function run(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      let errStr = '';
      stream.on('close', (code) => {
        resolve({ code, out, err: errStr });
      }).on('data', (d) => {
        out += d.toString();
      }).stderr.on('data', (d) => {
        errStr += d.toString();
      });
    });
  });
}

conn.on('ready', async () => {
  try {
    console.log('Backing up apache conf...');
    await run('cp /etc/apache2/sites-available/mogacarpet.ca.conf /etc/apache2/sites-available/mogacarpet.ca.conf.backup');

    console.log('Reading current conf...');
    const curConf = await run('cat /etc/apache2/sites-available/mogacarpet.ca.conf');
    
    // Check if ProxyPass already added
    if (curConf.out.includes('http://127.0.0.1:3000/')) {
      console.log('ProxyPass already present in config.');
    } else {
      // In <VirtualHost *:443>, add ProxyPass
      const updated = curConf.out.replace(
        '<VirtualHost *:443>',
        `<VirtualHost *:443>
    ProxyPreserveHost On
    ProxyPass /.well-known !
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/`
      );

      // Write updated conf safely
      const writeCmd = `cat << 'EOF' > /etc/apache2/sites-available/mogacarpet.ca.conf\n${updated}\nEOF`;
      await run(writeCmd);
      console.log('Updated /etc/apache2/sites-available/mogacarpet.ca.conf');
    }

    console.log('Running apache2ctl configtest...');
    const testRes = await run('apache2ctl configtest');
    console.log('[CONFIGTEST]:\n', testRes.out, testRes.err);

    if (testRes.out.includes('Syntax OK') || testRes.err.includes('Syntax OK')) {
      console.log('Reloading Apache...');
      await run('systemctl reload apache2');
      console.log('Apache reloaded successfully with Next.js reverse proxy!');
    } else {
      console.error('Config test failed, restoring backup...');
      await run('cp /etc/apache2/sites-available/mogacarpet.ca.conf.backup /etc/apache2/sites-available/mogacarpet.ca.conf');
      await run('systemctl reload apache2');
    }

  } catch (err) {
    console.error('Apache update error:', err);
  } finally {
    conn.end();
  }
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
});
