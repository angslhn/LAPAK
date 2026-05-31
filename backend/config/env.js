require('dotenv').config({ quiet: true });

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  port: Number(process.env.PORT) || 3000,
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: Number(process.env.DB_PORT) || 3306,
};
