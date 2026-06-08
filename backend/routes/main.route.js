const router = require('express').Router();

const apiRoutes = require('../routes/api.route');
const clientRoutes = require('../routes/client.route');

router.use(clientRoutes);
router.use('/api/v1', apiRoutes);

module.exports = router;
