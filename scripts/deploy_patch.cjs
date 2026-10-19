const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
        process.stdout.write(d);
      }).stderr.on('data', (d) => {
        errStr += d.toString();
        process.stderr.write(d);
      });
    });
  });
}

function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      console.log(`Uploading ${localPath} to ${remotePath}...`);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log('Upload finished!');
        resolve();
      });
      writeStream.on('error', reject);
      readStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
}

conn.on('ready', async () => {
  try {
    const localPatch = path.resolve(__dirname, '..', 'patch.tar.gz');
    const remotePatch = '/home/mogacarpet/app/patch.tar.gz';

    // 1. Upload patch.tar.gz
    await uploadFile(localPatch, remotePatch);

    // 2. Extract, build and restart PM2
    console.log('\n--- Extracting and building on server ---');
    const buildResult = await run(`
      cd /home/mogacarpet/app
      tar -xzf patch.tar.gz
      rm -f patch.tar.gz
      node scripts/update_carpet_units.cjs
      npm run build
      pm2 restart mogacarpet
      mysql -u mogacarpet -p9MlpYifiWYottlW mogacarpet -e "UPDATE settings SET value_text = '' WHERE key_name = 'announcement_text';" || true
      sleep 3
      echo "=== TESTING API SETTINGS ==="
      curl -s http://127.0.0.1:3050/api/settings
      echo ""
      echo "=== TESTING PUBLIC HOMEPAGE ==="
      curl -I -s http://127.0.0.1:3050/ | head -n 5
    `);

    console.log('\n--- DEPLOYMENT SUCCESSFUL ---');
  } catch (err) {
    console.error('Deployment error:', err);
  } finally {
    conn.end();
  }
}).connect({
  host: '62.84.184.96',
  port: 22,
  username: 'root',
  password: 'gDdsK5j9EGN8yyHlg1I12r1AD',
  readyTimeout: 30000,
});
