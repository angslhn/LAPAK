const router = require('express').Router();

const validation = require('../middleware/validation');

const CategoryValidation = require('../validations/category.validation');

const {
  getAllHandler,
  createHandler,
  updateHandler,
} = require('../controllers/category.controller');

router.get('/', getAllHandler);
router.post(
  '/',
  validation([['name', 'string']], CategoryValidation.create),
  createHandler
);
router.put(
  '/:id',
  validation(
    [
      ['id', 'string'],
      ['name', 'string'],
    ],
    CategoryValidation.update
  ),
  updateHandler
);

module.exports = router;
