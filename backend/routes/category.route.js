const router = require('express').Router();

const {
  getAllHandler,
  createHandler,
  updateHandler,
} = require('../controllers/category.controller');

router.get('/', getAllHandler);
router.post('/', createHandler);
router.put('/:id', updateHandler);

module.exports = router;
