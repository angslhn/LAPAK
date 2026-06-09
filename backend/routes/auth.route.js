const router = require('express').Router();
const passport = require('../lib/passport');

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

router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/logout', logoutHandler);

module.exports = router;
