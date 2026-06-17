const router = require('express').Router();

const validation = require('../middleware/validation');
const SupplierDebtValidation = require('../validations/supplier_debt.validation');

const {
  getAllHandler,
  getByIdHandler,
  getUpcomingHandler,
  getAgingHandler,
  createHandler,
  updateHandler,
  removeHandler,
} = require('../controllers/supplier_debt.controller');

router.get('/', getAllHandler);
router.get('/upcoming', getUpcomingHandler);
router.get('/aging', getAgingHandler);
router.get('/:id', getByIdHandler);
router.post(
  '/',
  validation(
    [
      ['supplier_id', 'number'],
      ['date', 'string'],
      ['due_date', 'string'],
      ['receipt_number', 'string'],
      ['total', 'number'],
      ['note', 'string'],
    ],
    SupplierDebtValidation.create
  ),
  createHandler
);
router.put(
  '/:id',
  validation(
    [
      ['supplier_id', 'number'],
      ['due_date', 'string'],
      ['note', 'string'],
    ],
    SupplierDebtValidation.update
  ),
  updateHandler
);
router.delete('/:id', removeHandler);

module.exports = router;
