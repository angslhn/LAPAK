const router = require('express').Router();

const validation = require('../middleware/validation');

const ReportValidation = require('../validations/report.validation');

const {
  getRevenueHandler,
  getTopProductsHandler,
  getByCategoryHandler,
  getCategoryQuantityHandler,
} = require('../controllers/report.controller');

router.get(
  '/revenue',
  validation(
    [
      ['period', 'string'],
      ['from', 'string'],
      ['to', 'string'],
    ],
    ReportValidation.revenue
  ),
  getRevenueHandler
);
router.get(
  '/top-products',
  validation(
    [
      ['limit', 'string'],
      ['period', 'string'],
      ['from', 'string'],
      ['to', 'string'],
    ],
    ReportValidation.topProduct
  ),
  getTopProductsHandler
);
router.get('/categories/revenue', getByCategoryHandler);
router.get('/categories/quantity', getCategoryQuantityHandler);

module.exports = router;
