const UserInput = require('./inputs/user.input');

const login = (data) => {
  const { email, password } = data;

  const checkEmail = UserInput.email(email);
  if (checkEmail) throw new Error(checkEmail);

  if (!password || !password.trim())
    throw new Error('Kata sandi tidak boleh kosong');
};

const register = (data) => {
  const { name, email, password, phone, store_name, address } = data;

  const checkName = UserInput.name(name);
  if (checkName) throw new Error(checkName);

  const checkEmail = UserInput.email(email);
  if (checkEmail) throw new Error(checkEmail);

  const checkPassword = UserInput.password(password);
  if (checkPassword) throw new Error(checkPassword);

  const checkPhone = UserInput.phone(phone);
  if (checkPhone) throw new Error(checkPhone);

  const checkStoreName = UserInput.storeName(store_name);
  if (checkStoreName) throw new Error(checkStoreName);

  const checkAddress = UserInput.address(address);
  if (checkAddress) throw new Error(checkAddress);
};

const forgotPassword = (data) => {
  const { email } = data;

  const checkEmail = UserInput.email(email);
  if (checkEmail) throw new Error(checkEmail);
};

const resetPassword = (data) => {
  const { token, new_password } = data;

  const checkToken = UserInput.token(token);
  if (checkToken) throw new Error(checkToken);

  const checkPassword = UserInput.password(new_password);
  if (checkPassword) throw new Error(checkPassword);
};

module.exports = { login, register, forgotPassword, resetPassword };
