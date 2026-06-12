const router = require('express').Router();

const passport = require('../lib/passport');
const validation = require('../middleware/validation');

const AuthValidation = require('../validations/auth.validation');

const {
  authCookieName,
  isProduction,
  cookieMaxAge,
  clientURL,
} = require('../config/env');

const {
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
} = require('../controllers/auth.controller');

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: clientURL + '/masuk?error=oauth_failed',
  }),
  (req, res) => {
    const { token } = req.user;

    res.cookie(authCookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    });

    res.redirect(clientURL + '/beranda');
  }
);

router.post(
  '/login',
  validation(
    [
      ['email', 'string'],
      ['password', 'string'],
    ],
    AuthValidation.login
  ),
  loginHandler
);
router.post(
  '/register',
  validation(
    [
      ['name', 'string'],
      ['email', 'string'],
      ['password', 'string'],
      ['phone', 'string'],
      ['store_name', 'string'],
      ['address', 'string'],
    ],
    AuthValidation.register
  ),
  registerHandler
);
router.post(
  '/forgot-password',
  validation([['email', 'string']], AuthValidation.forgotPassword),
  forgotPasswordHandler
);
router.post(
  '/reset-password',
  validation(
    [
      ['token', 'string'],
      ['new_password', 'string'],
    ],
    AuthValidation.resetPassword
  ),
  resetPasswordHandler
);
router.post('/logout', logoutHandler);

module.exports = router;
