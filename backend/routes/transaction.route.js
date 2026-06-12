const router = require('express').Router();

const validation = require('../middleware/validation');

const TransactionValidation = require('../validations/transaction.validation');

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  cancelHandler,
} = require('../controllers/transaction.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post(
  '/',
  validation(
    [
      ['customer_id', 'number'],
      ['payment_method', 'string'],
      ['items', 'object'],
      ['discount', 'number'],
      ['tax', 'number'],
      ['due_date', 'string'],
      ['note', 'string'],
    ],
    TransactionValidation.create
  ),
  createHandler
);
router.patch('/:id/cancel', cancelHandler);

module.exports = router;
