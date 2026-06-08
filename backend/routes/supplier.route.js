const router = require('express').Router();

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  removeHandler,
} = require('../controllers/supplier.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post('/', createHandler);
router.put('/:id', updateHandler);
router.delete('/:id', removeHandler);

module.exports = router;
