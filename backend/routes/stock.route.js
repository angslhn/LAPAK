const router = require('express').Router();

const validation = require('../middleware/validation');

const StockValidation = require('../validations/stock.validation');

const {
  getAllHandler,
  getLowStockHandler,
  adjustStockHandler,
  getMutationsHandler,
  getMutationsByProductHandler,
} = require('../controllers/stock.controller');

router.get('/', getAllHandler);
router.get('/low', getLowStockHandler);
router.patch(
  '/:id',
  validation(
    [
      ['id', 'string'],
      ['type', 'string'],
      ['quantity', 'number'],
      ['note', 'string'],
    ],
    StockValidation.adjust
  ),
  adjustStockHandler
);
router.get('/mutations', getMutationsHandler);
router.get('/mutations/:id', getMutationsByProductHandler);

module.exports = router;
