const router = require('express').Router();

const {
  getAllHandler,
  getLowStockHandler,
  adjustStockHandler,
  getMutationsHandler,
  getMutationsByProductHandler,
} = require('../controllers/stock.controller');

router.get('/', getAllHandler);
router.get('/low', getLowStockHandler);
router.patch('/:id', adjustStockHandler);
router.get('/mutations', getMutationsHandler);
router.get('/mutations/:id', getMutationsByProductHandler);

module.exports = router;
