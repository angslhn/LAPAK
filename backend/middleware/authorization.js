const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { authCookieName, jwtSecret } = require('../config/env');
const { error } = require('../helpers/response');

const {
  AUTH_UNAUTHORIZED,
  WITHDRAW_FORBIDDEN,
} = require('../helpers/error_codes');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const requireAuth = (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) return res.redirect('/masuk');

  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    res.redirect('/masuk');
  }
};

const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) return next();

  try {
    jwt.verify(token, jwtSecret);
    return res.redirect('/beranda');
  } catch (err) {
    next();
  }
};

const authorizeOwner = async (req, res, next) => {
  try {
    const token = req.cookies[authCookieName];

    if (!token) {
      const code = AUTH_UNAUTHORIZED;
      return error(res, code, ERROR_MESSAGES[code], ERROR_STATUS[code]);
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== 'owner' || decoded.id !== 1) {
      const code = WITHDRAW_FORBIDDEN;
      return error(res, code, ERROR_MESSAGES[code], ERROR_STATUS[code]);
    }

    req.user = decoded;
    next();
  } catch (err) {
    let code = err.message;

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      code = AUTH_UNAUTHORIZED;
    } else if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code] || err.message;
    const httpStatus = ERROR_STATUS[code] || 500;

    return error(res, code, message, httpStatus);
  }
};

module.exports = { requireAuth, redirectIfAuthenticated, authorizeOwner };
