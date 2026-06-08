const router = require('express').Router();

const {
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  logoutHandler,
} = require('../controllers/auth.controller');

router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.post('/logout', logoutHandler);

module.exports = router;
