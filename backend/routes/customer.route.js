const router = require('express').Router();

const validation = require('../middleware/validation');

const CustomerValidation = require('../validations/customer.validation');

const {
  getAllHandler,
  createHandler,
  updateHandler,
  getReceivablesHandler,
} = require('../controllers/customer.controller');

router.get('/', getAllHandler);
router.post(
  '/',
  validation(
    [
      ['name', 'string'],
      ['phone', 'string'],
    ],
    CustomerValidation.create
  ),
  createHandler
);
router.put(
  '/:id',
  validation(
    [
      ['id', 'string'],
      ['name', 'string'],
      ['phone', 'string'],
    ],
    CustomerValidation.update
  ),
  updateHandler
);
router.get('/:id/receivables', getReceivablesHandler);

module.exports = router;
