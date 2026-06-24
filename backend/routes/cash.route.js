const router = require('express').Router();

const authorizeOwner = require('../middleware/authorization').authorizeOwner;
const validation = require('../middleware/validation');
const checkDailyReport = require('../middleware/check_daily_report');

const CashValidation = require('../validations/cash.validation');

const {
  getAllHandler,
  getByDateHandler,
  createIncomeHandler,
  createExpenseHandler,
  updateCashHandler,
  deleteCashHandler,
  withdrawHandler,
} = require('../controllers/cash.controller');

router.get('/', getByDateHandler);
router.get('/list', getAllHandler);
router.post(
  '/income',
  checkDailyReport,
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
  checkDailyReport,
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
router.post(
  '/withdraw',
  authorizeOwner,
  checkDailyReport,
  validation(
    [
      ['amount', 'number'],
      ['note', 'string'],
    ],
    CashValidation.withdraw
  ),
  withdrawHandler
);
router.put(
  '/:id',
  checkDailyReport,
  validation(
    [
      ['amount', 'number'],
      ['category', 'string'],
      ['date', 'string'],
      ['note', 'string'],
    ],
    CashValidation.update
  ),
  updateCashHandler
);
router.delete('/:id', checkDailyReport, deleteCashHandler);

module.exports = router;
