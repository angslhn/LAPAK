const router = require('express').Router();

const {
  getCustomerDebtsHandler,
  payCustomerDebtHandler,
  getSupplierDebtsHandler,
  paySupplierDebtHandler,
} = require('../controllers/debt.controller');

router.get('/customers', getCustomerDebtsHandler);
router.patch('/customers/:id', payCustomerDebtHandler);
router.get('/suppliers', getSupplierDebtsHandler);
router.patch('/suppliers/:id', paySupplierDebtHandler);

module.exports = router;
