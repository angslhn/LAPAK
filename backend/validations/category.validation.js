const CategoryInput = require('./inputs/category.input');

const create = (data) => {
  const { name } = data;

  const checkCategory = CategoryInput.category(name);
  if (checkCategory) throw new Error(checkCategory);
};

const update = (data) => {
  const { id } = data;

  const checkCategoryId = CategoryInput.categoryId(id);
  if (checkCategoryId) throw new Error(checkCategoryId);

  create(data);
};
