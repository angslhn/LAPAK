const router = require('express').Router();

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  cancelHandler,
} = require('../controllers/transaction.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post('/', createHandler);
router.patch('/:id/cancel', cancelHandler);

module.exports = router;
