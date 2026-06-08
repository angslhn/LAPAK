const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { authCookieName, jwtSecret } = require('../config/env');
const { view } = require('../helpers/view');

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

module.exports = { requireAuth, redirectIfAuthenticated };
