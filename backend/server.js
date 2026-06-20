const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

const mainRoutes = require('./routes/main.route');

const { port, isProduction, clientURL } = require('./config/env');
const { connectDatabase } = require('./lib/mysql');

const app = express();

connectDatabase();

const corsOptions = {
  origin: clientURL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

const morganFormat = isProduction ? 'tiny' : 'combined';
const morganStream = {
  write: (message) => {
    console.info(`[SERVER] ${message.trim()}`);
  },
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://res.cloudinary.com',
          'https://*.googleusercontent.com',
        ],
      },
    },
  })
);
app.use(cors(corsOptions));
app.use(morgan(morganFormat, { stream: morganStream }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(mainRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ENDPOINT_NOT_FOUND',
    message: 'Endpoint tidak ditemukan',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Terjadi kesalahan pada server',
  });
});

if (!isProduction) {
  app.listen(port, () => {
    console.info(`[SERVER] Berjalan pada port ${port}`);
  });
}

module.exports = app;
