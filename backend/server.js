const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { isProduction, port, baseURL } = require('./config/env');
const { connectDatabase } = require('./lib/mysql');

const app = express();

connectDatabase();

const corsOptions = {
  origin: baseURL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

const morganFormat = isProduction ? 'tiny' : 'combined';
const morganStream = {
  write: (message) => {
    console.info(`[SERVER] ${message.trim()}`);
  },
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(morganFormat, { stream: morganStream }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res) => {
  res.status(404).send({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: 'Kesalahan server internal' });
});

if (!isProduction) {
  app.listen(port, () => {
    console.info(`[SERVER] Berjalan pada port ${port}`);
  });
}

module.exports = app;
