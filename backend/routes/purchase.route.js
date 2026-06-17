const router = require('express').Router();

const validation = require('../middleware/validation');
const checkDailyReport = require('../middleware/check_daily_report');

const PurchaseValidation = require('../validations/purchase.validation');

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  markAsPaidHandler,
} = require('../controllers/purchase.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post(
  '/',
  checkDailyReport,
  validation(
    [
      ['supplier_id', 'number'],
      ['date', 'string'],
      ['due_date', 'string'],
      ['items', 'object'],
      ['note', 'string'],
      ['payment_status', 'string'],
    ],
    PurchaseValidation.create
  ),
  createHandler
);
router.patch('/:id/paid', checkDailyReport, markAsPaidHandler);

module.exports = router;
