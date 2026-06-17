const router = require('express').Router();

const validation = require('../middleware/validation');
const checkDailyReport = require('../middleware/check_daily_report');

const DebtValidation = require('../validations/debt.validation');

const {
  getCustomerDebtsHandler,
  payCustomerDebtHandler,
  updateCustomerDebtHandler,
  deleteCustomerDebtHandler,
  getSupplierDebtsHandler,
  paySupplierDebtHandler,
  updateSupplierDebtHandler,
  deleteSupplierDebtHandler,
} = require('../controllers/debt.controller');

router.get('/customers', getCustomerDebtsHandler);
router.put(
  '/customers/:id',
  checkDailyReport,
  validation(
    [
      ['customer_name', 'string'],
      ['customer_phone', 'string'],
      ['due_date', 'string'],
      ['note', 'string'],
    ],
    DebtValidation.updateCustomerDebt
  ),
  updateCustomerDebtHandler
);
router.patch(
  '/customers/:id/pay',
  checkDailyReport,
  validation(
    [
      ['payment_amount', 'number'],
      ['payment_date', 'string'],
      ['payment_method', 'string'],
      ['note', 'string'],
    ],
    DebtValidation.payCustomerDebt
  ),
  payCustomerDebtHandler
);
router.delete('/customers/:id', checkDailyReport, deleteCustomerDebtHandler);
router.get('/suppliers', getSupplierDebtsHandler);
router.put(
  '/suppliers/:id',
  checkDailyReport,
  validation(
    [
      ['supplier_id', 'number'],
      ['due_date', 'string'],
      ['note', 'string'],
    ],
    DebtValidation.updateSupplierDebt
  ),
  updateSupplierDebtHandler
);
router.patch(
  '/suppliers/:id/pay',
  checkDailyReport,
  validation(
    [
      ['payment_amount', 'number'],
      ['payment_method', 'string'],
      ['note', 'string'],
    ],
    DebtValidation.paySupplierDebt
  ),
  paySupplierDebtHandler
);
router.delete('/suppliers/:id', checkDailyReport, deleteSupplierDebtHandler);

module.exports = router;
