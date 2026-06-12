const mysql = require('mysql2/promise');

const {
  isProduction,
  dbHost,
  dbUser,
  dbName,
  dbPassword,
  dbPort,
} = require('../config/env');

let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      database: dbName,
      password: dbPassword,
      port: dbPort,
      timezone: '+07:00',
      decimalNumbers: true,
      waitForConnections: true,
      connectionLimit: isProduction ? 1 : 10,
      maxIdle: isProduction ? 1 : 10,
      idleTimeout: isProduction ? 10000 : 60000,
      queueLimit: 0,
      enableKeepAlive: !isProduction,
      keepAliveInitialDelay: 0,
      ...(isProduction && {
        ssl: { rejectUnauthorized: true },
      }),
    });
  }

  return pool;
};

const connectDatabase = async () => {
  const pool = getPool();

  let connection;

  try {
    connection = await pool.getConnection();
    console.info('[DATABASE] Berhasil terhubung');
  } catch {
    console.info('[DATABASE] Gagal terhubung');
  } finally {
    connection?.release();
  }
};

module.exports = { getPool, connectDatabase };
