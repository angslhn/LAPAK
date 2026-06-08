const jwt = require('jsonwebtoken');

const { authCookieName, jwtSecret } = require('../config/env');
const { error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const { AUTH_UNAUTHORIZED } = require('../helpers/error_codes');

const authenticate = async (req, res, next) => {
  try {
    const authCookie = req.cookies[authCookieName];

    if (!authCookie) {
      const code = AUTH_UNAUTHORIZED;

      return error(res, code, ERROR_MESSAGES[code], ERROR_STATUS[code]);
    }

    const token = jwt.verify(authCookie, jwtSecret);

    req.user = token;

    next();
  } catch (err) {
    const code =
      err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'
        ? AUTH_UNAUTHORIZED
        : 'INTERNAL_SERVER_ERROR';

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

module.exports = { authenticate };
