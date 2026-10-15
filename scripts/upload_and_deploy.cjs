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

function uploadFileWithProgress(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const stat = fs.statSync(localPath);
      const totalBytes = stat.size;
      let transferred = 0;
      let lastReport = 0;

      console.log(`Starting upload: ${(totalBytes / 1024 / 1024).toFixed(1)} MB...`);
      const readStream = fs.createReadStream(localPath, { highWaterMark: 1024 * 1024 * 2 }); // 2MB chunks
      const writeStream = sftp.createWriteStream(remotePath, { highWaterMark: 1024 * 1024 * 2 });

      readStream.on('data', (chunk) => {
        transferred += chunk.length;
        const mb = transferred / 1024 / 1024;
        if (mb - lastReport >= 25 || transferred === totalBytes) {
          lastReport = mb;
          const pct = ((transferred / totalBytes) * 100).toFixed(1);
          console.log(`Upload progress: ${mb.toFixed(1)} MB / ${(totalBytes / 1024 / 1024).toFixed(1)} MB (${pct}%)`);
        }
      });

      writeStream.on('close', () => {
        console.log('Upload finished completely!');
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
    const localArchive = path.resolve(__dirname, '..', 'deploy.tar.gz');
    const remoteArchive = '/home/mogacarpet/deploy.tar.gz';

    // 1. Upload archive
    await uploadFileWithProgress(localArchive, remoteArchive);

    // 2. Extract into /home/mogacarpet/app
    console.log('\n--- Extracting application into /home/mogacarpet/app ---');
    await run('mkdir -p /home/mogacarpet/app && tar -xzf /home/mogacarpet/deploy.tar.gz -C /home/mogacarpet/app/');

    // 3. Write environment configuration
    console.log('\n--- Creating .env.local on server ---');
    const envContent = [
      'DB_HOST=127.0.0.1',
      'DB_USER=mogacarpet',
      'DB_PASSWORD=9MlpYifiWYottlW',
      'DB_NAME=mogacarpet',
      'DB_PORT=3306',
      'AUTH_SECRET=moga-carpet-flooring-secret-token-key-2026',
      'PORT=3000',
      'NODE_ENV=production'
    ].join('\\n');
    await run(`printf "${envContent}\\n" > /home/mogacarpet/app/.env.local`);

    // 4. Install npm dependencies
    console.log('\n--- Installing NPM dependencies ---');
    await run('cd /home/mogacarpet/app && npm install');

    // 5. Build Next.js application
    console.log('\n--- Building Next.js production bundle ---');
    await run('cd /home/mogacarpet/app && npm run build');

    // 6. Setup / Restart PM2 service
    console.log('\n--- Managing PM2 process ---');
    await run('pm2 delete mogacarpet 2>/dev/null || true');
    await run('cd /home/mogacarpet/app && pm2 start npm --name "mogacarpet" -- start -- -p 3000');
    await run('pm2 save');

    // 7. Verify local port 3000
    console.log('\n--- Testing local port 3000 on server ---');
    const testLocal = await run('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/');
    console.log('HTTP Status on 127.0.0.1:3000:', testLocal.out);

    // 8. Fix file ownership
    console.log('\n--- Setting file permissions ---');
    await run('chown -R mogacarpet:mogacarpet /home/mogacarpet/app');

    console.log('\n--- DEPLOYMENT COMPLETE ---');
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
