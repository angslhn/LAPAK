const router = require('express').Router();

const { image } = require('../middleware/image');

const {
  getMeHandler,
  updateAvatarHandler,
  updateProfileHandler,
  changePasswordHandler,
} = require('../controllers/user.controller');

router.get('/me', getMeHandler);
router.put('/me', updateProfileHandler);
router.patch('/me/avatar', image, updateAvatarHandler);
router.put('/me/password', changePasswordHandler);

module.exports = router;
