const router = require('express').Router();

const validation = require('../middleware/validation');

const SupplierValidation = require('../validations/supplier.validation');

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  removeHandler,
} = require('../controllers/supplier.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post(
  '/',
  validation(
    [
      ['name', 'string'],
      ['phone', 'string'],
      ['email', 'string'],
      ['contact_person', 'string'],
      ['address', 'string'],
      ['note', 'string'],
    ],
    SupplierValidation.create
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
      ['email', 'string'],
      ['contact_person', 'string'],
      ['address', 'string'],
      ['note', 'string'],
    ],
    SupplierValidation.update
  ),
  updateHandler
);
router.delete('/:id', removeHandler);

module.exports = router;
