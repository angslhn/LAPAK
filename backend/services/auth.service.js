const UserModel = require('../models/user.model');
const PasswordResetModel = require('../models/password_reset.model');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { sendResetPasswordEmail } = require('../helpers/mailer');

const {
  AUTH_INVALID_CREDENTIALS,
  AUTH_EMAIL_ALREADY_EXISTS,
} = require('../helpers/error_codes');

const login = async (data) => {
  try {
    const { email, password } = data;

    const user = await UserModel.findByEmail(email);

    if (!user || !user.password) throw new Error(AUTH_INVALID_CREDENTIALS);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error(AUTH_INVALID_CREDENTIALS);

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const register = async (data) => {
  try {
    const { name, email, password, phone, store_name, address } = data;

    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) throw new Error(AUTH_EMAIL_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      store_name,
      address,
      role: 'owner',
    });

    return userId;
  } catch (err) {
    throw new Error(err.message);
  }
};

const forgotPassword = async (data) => {
  const { email } = data;

  const user = await UserModel.findByEmail(email);

  if (!user) return true;

  const token = crypto.randomBytes(32).toString('hex');

  const expiredAt = new Date();

  expiredAt.setHours(expiredAt.getHours() + 1);

  await PasswordResetModel.create({
    email,
    token,
    expired_at: expiredAt,
  });

  await sendResetPasswordEmail(email, token);

  return true;
};

const resetPassword = async (data) => {
  const { token, new_password } = data;

  const passwordReset = await PasswordResetModel.findByToken(token);

  if (!passwordReset) throw new Error('AUTH_INVALID_RESET_TOKEN');

  const { email } = passwordReset;

  const user = await UserModel.findByEmail(email);

  if (!user) throw new Error('AUTH_INVALID_RESET_TOKEN');

  const hashedPassword = await bcrypt.hash(new_password, 10);

  await UserModel.update({ id: user.id, password: hashedPassword });

  await PasswordResetModel.remove(token);

  return true;
};

const logout = () => true;

module.exports = { login, register, forgotPassword, resetPassword, logout };
