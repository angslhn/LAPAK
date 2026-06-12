const CategoryInput = require('./inputs/category.input');

const create = (data) => {
  const { name } = data;

  const checkName = CategoryInput.category(name);
  if (checkName) throw new Error(checkName);
};

const update = (data) => {
  const { id } = data;

  const checkId = CategoryInput.id(id);
  if (checkId) throw new Error(checkId);

  create(data);
};

module.exports = { create, update };
