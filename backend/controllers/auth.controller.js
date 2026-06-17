const AuthService = require('../services/auth.service');

const { isProduction, authCookieName, cookieMaxAge } = require('../config/env');
const { ok, created, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await AuthService.login({ email, password });

    const { token, user } = data;

    res.cookie(authCookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    });

    return ok(res, user, 'Anda berhasil masuk');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const registerHandler = async (req, res) => {
  try {
    const { name, email, password, phone, store_name, address } = req.body;

    await AuthService.register({
      name,
      email,
      password,
      phone,
      store_name,
      address,
    });

    return created(res, null, 'Pendaftaran pengguna berhasil');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;

    await AuthService.forgotPassword({ email });

    return ok(res, null, 'Email untuk perubahan kata sandi telah dikirim');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    await AuthService.resetPassword({ token, new_password });

    return ok(res, null, 'Kata sandi berhasil diubah');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const logoutHandler = async (req, res) => {
  try {
    await AuthService.logout();

    res.clearCookie(authCookieName, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });

    return ok(res, null, 'Anda berhasil keluar');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

module.exports = {
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
};
