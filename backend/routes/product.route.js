const router = require('express').Router();

const image = require('../middleware/image');
const validation = require('../middleware/validation');

const ProductValidation = require('../validations/product.validation');

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
router.post(
  '/',
  image,
  validation(
    [
      ['category_id', 'number'],
      ['name', 'string'],
      ['sku', 'string'],
      ['barcode', 'string'],
      ['weight', 'number'],
      ['purchase_price', 'number'],
      ['selling_price', 'number'],
      ['stock', 'number'],
      ['minimum_stock', 'number'],
      ['unit', 'string'],
    ],
    ProductValidation.create
  ),
  createHandler
);
router.patch('/:id/image', image, updateImageHandler);
router.put(
  '/:id',
  validation(
    [
      ['id', 'string'],
      ['category_id', 'number'],
      ['name', 'string'],
      ['sku', 'string'],
      ['barcode', 'string'],
      ['weight', 'number'],
      ['purchase_price', 'number'],
      ['selling_price', 'number'],
      ['stock', 'number'],
      ['minimum_stock', 'number'],
      ['unit', 'string'],
    ],
    ProductValidation.update
  ),
  updateHandler
);
router.delete('/:id', removeHandler);

module.exports = router;
