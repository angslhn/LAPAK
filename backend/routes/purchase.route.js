const router = require('express').Router();

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  markAsPaidHandler,
} = require('../controllers/purchase.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post('/', createHandler);
router.patch('/:id/paid', markAsPaidHandler);

module.exports = router;
