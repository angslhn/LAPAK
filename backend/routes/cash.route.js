const router = require('express').Router();

const {
  getAllHandler,
  getByDateHandler,
  createIncomeHandler,
  createExpenseHandler,
} = require('../controllers/cash.controller');

router.get('/', getByDateHandler);
router.get('/list', getAllHandler);
router.post('/income', createIncomeHandler);
router.post('/expense', createExpenseHandler);

module.exports = router;
