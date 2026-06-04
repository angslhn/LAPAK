const CategoryModel = require('../models/category.model');
const ProductModel = require('../models/product.model');

const {
  PRODUCT_NOT_FOUND,
  CATEGORY_NOT_FOUND,
  PRODUCT_DELETE_FAILED,
  PRODUCT_UPDATE_FAILED,
  PRODUCT_SKU_ALREADY_EXISTS,
} = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await ProductModel.findAllWithCategory();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (data) => {
  try {
    const { id } = data;

    const product = await ProductModel.findById(id);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    return product;
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  try {
    const { category_id, sku } = data;

    const product = await ProductModel.findBySKU(sku);

    if (product) throw new Error(PRODUCT_SKU_ALREADY_EXISTS);

    const category = await CategoryModel.findById(category_id);

    if (!category) throw new Error(CATEGORY_NOT_FOUND);

    return await ProductModel.create(data);
  } catch (err) {
    throw new Error(err.message);
  }
};

const update = async (data) => {
  try {
    const { id, ...fields } = data;

    const product = await ProductModel.findById(id);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    if (fields.category_id) {
      const category = await CategoryModel.findById(fields.category_id);

      if (!category) throw new Error(CATEGORY_NOT_FOUND);
    }

    const result = await ProductModel.update({ id, ...fields });

    if (result === 0) throw new Error(PRODUCT_UPDATE_FAILED);

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

const remove = async (data) => {
  try {
    const { id } = data;

    const product = await ProductModel.findById(id);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    const result = await ProductModel.remove(id);

    if (result === 0) throw new Error(PRODUCT_DELETE_FAILED);

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, getById, create, update, remove };
