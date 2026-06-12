const UserInput = require('./inputs/user.input');

const update = (data) => {
  const { name, email, phone, store_name, address } = data;

  const checkName = UserInput.name(name);
  if (checkName) throw new Error(checkName);

  const checkEmail = UserInput.email(email);
  if (checkEmail) throw new Error(checkEmail);

  const checkPhone = UserInput.phone(phone);
  if (checkPhone) throw new Error(checkPhone);

  const checkStoreName = UserInput.storeName(store_name);
  if (checkStoreName) throw new Error(checkStoreName);

  const checkAddress = UserInput.address(address);
  if (checkAddress) throw new Error(checkAddress);
};

module.exports = { update };
