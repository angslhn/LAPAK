const router = require('express').Router();

const validation = require('../middleware/validation');

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
  validation(
    [
      ['supplier_id', 'number'],
      ['date', 'string'],
      ['due_date', 'string'],
      ['items', 'object'],
      ['note', 'string'],
    ],
    PurchaseValidation.create
  ),
  createHandler
);
router.patch('/:id/paid', markAsPaidHandler);

module.exports = router;
