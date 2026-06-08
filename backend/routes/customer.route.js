const router = require('express').Router();

const {
  getAllHandler,
  createHandler,
  getReceivablesHandler,
} = require('../controllers/customer.controller');

router.get('/', getAllHandler);
router.post('/', createHandler);
router.get('/:id/receivables', getReceivablesHandler);

module.exports = router;
