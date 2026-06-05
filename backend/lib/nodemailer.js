const nodemailer = require('nodemailer');

const { smtpHost, smtpPort, smtpUser, smtpPass } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

module.exports = { transporter };
