import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Testing connection to MySQL at localhost:3306 with user "root" and blank password...');
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
    });
    console.log('✅ Successfully connected to MySQL!');

    const [dbs] = await conn.query('SHOW DATABASES;');
    console.log('Available databases:', dbs.map(d => Object.values(d)[0]));

    await conn.query('CREATE DATABASE IF NOT EXISTS `mogacarpet` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log('✅ Database `mogacarpet` verified / created!');

    await conn.end();
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

testConnection();
