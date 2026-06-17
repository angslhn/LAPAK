const router = require('express').Router();

const validation = require('../middleware/validation');
const checkDailyReport = require('../middleware/check_daily_report');

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
  checkDailyReport,
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
router.patch('/:id/cancel', checkDailyReport, cancelHandler);

module.exports = router;
