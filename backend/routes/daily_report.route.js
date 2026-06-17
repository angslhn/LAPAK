const router = require('express').Router();

const {
  getAllHandler,
  getTodayHandler,
  getByIdHandler,
  closeReportHandler,
  getClosureStatusHandler,
  closeAllPendingHandler,
} = require('../controllers/daily_report.controller');

router.get('/', getAllHandler);
router.get('/today', getTodayHandler);
router.get('/status', getClosureStatusHandler);
router.get('/:id', getByIdHandler);
router.post('/close', closeReportHandler);
router.post('/close-all', closeAllPendingHandler);

module.exports = router;
