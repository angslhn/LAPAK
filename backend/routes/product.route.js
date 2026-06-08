const router = require('express').Router();

const { image } = require('../middleware/image');

const {
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  updateImageHandler,
  removeHandler,
} = require('../controllers/product.controller');

router.get('/', getAllHandler);
router.get('/:id', getByIdHandler);
router.post('/', image, createHandler);
router.put('/:id', updateHandler);
router.patch('/:id/image', image, updateImageHandler);
router.delete('/:id', removeHandler);

module.exports = router;
