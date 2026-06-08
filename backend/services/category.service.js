const CategoryModel = require('../models/category.model');

const {
  CATEGORY_ALREADY_EXISTS,
  CATEGORY_NOT_FOUND,
  CATEGORY_UPDATE_FAILED,
} = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await CategoryModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  try {
    const { name } = data;

    const category = await CategoryModel.findByName(name);

    if (category) throw new Error(CATEGORY_ALREADY_EXISTS);

    const id = await CategoryModel.create(data);

    return { id };
  } catch (err) {
    throw new Error(err.message);
  }
};

const update = async (data) => {
  try {
    const { id, name } = data;

    const category = await CategoryModel.findById(id);

    if (!category) throw new Error(CATEGORY_NOT_FOUND);

    const affectedRows = await CategoryModel.update({ id, name });

    if (affectedRows === 0) throw new Error(CATEGORY_UPDATE_FAILED);

    return { affected_rows: affectedRows };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, create, update };
