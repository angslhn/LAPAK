const router = require('express').Router();

const validation = require('../middleware/validation');
const image = require('../middleware/image');

const BankAccountValidation = require('../validations/bank_account.validation');

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  removeHandler,
  getQRISHandler,
  uploadQRISHandler,
  deleteQRISHandler,
} = require('../controllers/bank_account.controller');

router.get('/qris', getQRISHandler);
router.post('/qris', image, uploadQRISHandler);
router.delete('/qris', deleteQRISHandler);
router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post(
  '/',
  validation(
    [
      ['bank_name', 'string'],
      ['account_number', 'string'],
      ['account_owner', 'string'],
    ],
    BankAccountValidation.create
  ),
  createHandler
);
router.put(
  '/:id',
  validation(
    [
      ['bank_name', 'string'],
      ['account_number', 'string'],
      ['account_owner', 'string'],
      ['is_active', 'boolean'],
    ],
    BankAccountValidation.update
  ),
  updateHandler
);
router.delete('/:id', removeHandler);

module.exports = router;
