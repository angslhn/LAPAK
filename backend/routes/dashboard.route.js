const router = require('express').Router();

const { getSummaryHandler } = require('../controllers/dashboard.controller');

router.get('/', getSummaryHandler);

module.exports = router;
