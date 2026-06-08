const router = require('express').Router();

const {
  getAllHandler,
  getTodayHandler,
  getByIdHandler,
  closeReportHandler,
} = require('../controllers/daily_report.controller');

router.get('/', getAllHandler);
router.get('/today', getTodayHandler);
router.get('/:id', getByIdHandler);
router.post('/close', closeReportHandler);

module.exports = router;
