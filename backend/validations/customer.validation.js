const CustomerInput = require('./inputs/customer.input');

const create = (data) => {
  const { name, phone } = data;

  const checkName = CustomerInput.name(name);
  if (checkName) throw new Error(checkName);

  const checkPhone = CustomerInput.phone(phone);
  if (checkPhone) throw new Error(checkPhone);
};

const update = (data) => {
  const { id } = data;

  const CheckId = CustomerInput.id(id);
  if (CheckId) throw new Error(CheckId);

  create(data);
};

module.exports = { create };
