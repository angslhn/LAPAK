const router = require('express').Router();

const {
  getRevenueHandler,
  getTopProductsHandler,
  getByCategoryHandler,
  getCategoryQuantityHandler,
} = require('../controllers/report.controller');

router.get('/revenue', getRevenueHandler);
router.get('/top-products', getTopProductsHandler);
router.get('/categories/revenue', getByCategoryHandler);
router.get('/categories/quantity', getCategoryQuantityHandler);

module.exports = router;
