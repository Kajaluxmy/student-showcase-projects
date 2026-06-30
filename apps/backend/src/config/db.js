const mysql = require('mysql2/promise');
const env = require('./env');

const fs = require('fs');
const path = require('path');

const poolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Check for ca.pem file to connect securely to Aiven/remote MySQL
const caPath = path.join(__dirname, '../../ca.pem');
if (fs.existsSync(caPath)) {
  poolConfig.ssl = {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true
  };
  console.log('🔒 Database connection SSL configured successfully using ca.pem.');
} else if (env.DB_HOST && env.DB_HOST !== '127.0.0.1' && env.DB_HOST !== 'localhost') {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

// Verification function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection pool established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
