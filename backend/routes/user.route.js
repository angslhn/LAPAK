const router = require('express').Router();

const image = require('../middleware/image');
const validation = require('../middleware/validation');

const UserValidation = require('../validations/user.validation');

const {
  getMeHandler,
  updateAvatarHandler,
  updateProfileHandler,
  changePasswordHandler,
} = require('../controllers/user.controller');

router.get('/me', getMeHandler);
router.patch('/me/avatar', image, updateAvatarHandler);
router.put(
  '/me',
  validation(
    [
      ['name', 'string'],
      ['email', 'string'],
      ['phone', 'string'],
      ['store_name', 'string'],
      ['address', 'string'],
    ],
    UserValidation.update
  ),
  updateProfileHandler
);
router.put('/me/password', changePasswordHandler);

module.exports = router;
