const router = require('express').Router();

const validation = require('../middleware/validation');

const CashValidation = require('../validations/cash.validation');

const {
  getAllHandler,
  getByDateHandler,
  createIncomeHandler,
  createExpenseHandler,
} = require('../controllers/cash.controller');

router.get('/', getByDateHandler);
router.get('/list', getAllHandler);
router.post(
  '/income',
  validation(
    [
      ['date', 'string'],
      ['amount', 'number'],
      ['note', 'string'],
    ],
    CashValidation.create
  ),
  createIncomeHandler
);
router.post(
  '/expense',
  validation(
    [
      ['date', 'string'],
      ['amount', 'number'],
      ['note', 'string'],
    ],
    CashValidation.create
  ),
  createExpenseHandler
);

module.exports = router;
