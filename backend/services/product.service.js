const CategoryModel = require('../models/category.model');
const ProductModel = require('../models/product.model');

const { v4: uuidv4 } = require('uuid');

const { cloudinary } = require('../lib/cloudinary');

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

const create = async (data, file_buffer = null) => {
  try {
    const { category_id, sku } = data;

    const product = await ProductModel.findBySKU(sku);

    if (product) throw new Error(PRODUCT_SKU_ALREADY_EXISTS);

    const category = await CategoryModel.findById(category_id);

    if (!category) throw new Error(CATEGORY_NOT_FOUND);

    let image_url = null;
    let image_public_id = null;

    if (file_buffer) {
      const publicId = uuidv4();

      try {
        image_url = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'product_images',
                public_id: publicId,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file_buffer);
        });

        image_public_id = publicId;
      } catch (err) {
        console.info('[CLOUDINARY] Upload image failed:', err.message);
      }
    }

    const productId = await ProductModel.create({
      ...data,
      image_url,
      image_public_id,
    });

    return productId;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateImage = async (id, file_buffer) => {
  try {
    const product = await ProductModel.findById(id);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    let image_url = null;
    let image_public_id = null;

    if (product.image_public_id) {
      try {
        await cloudinary.uploader.destroy(product.image_public_id);
      } catch (err) {
        console.info('[CLOUDINARY] Delete old image failed:', err.message);
      }
    }

    if (file_buffer) {
      const publicId = uuidv4();

      try {
        image_url = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'product_images',
                public_id: publicId,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file_buffer);
        });

        image_public_id = publicId;
      } catch (err) {
        throw new Error('IMAGE_UPLOAD_FAILED');
      }
    }

    await ProductModel.update({ id, image_url, image_public_id });

    return { image_url, image_public_id };
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateImage,
  remove,
};
