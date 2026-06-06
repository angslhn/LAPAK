const UserService = require('../services/user.service');

const { ok, error } = require('../helpers/response');

const { ERROR_MESSAGES } = require('../helpers/error_messages');
const { ERROR_STATUS } = require('../helpers/error_status');

const getMeHandler = async (req, res) => {
  try {
    const { id } = req.user;

    const data = await UserService.getMe({ id });

    return ok(res, data);
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const updateProfileHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, phone, store_name, address } = req.body;

    const data = await UserService.updateProfile({
      id,
      name,
      email,
      phone,
      store_name,
      address,
    });

    return ok(res, data, 'Profil berhasil diperbarui');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const updateAvatarHandler = async (req, res) => {
  try {
    const { id } = req.user;

    const file_buffer = req.file?.buffer || null;

    if (!file_buffer) {
      return error(res, 'NO_IMAGE_PROVIDED', 'Gambar tidak ditemukan', 400);
    }

    const avatar_url = await UserService.updateAvatar({
      user_id: id,
      file_buffer,
    });

    return ok(res, { avatar_url }, 'Avatar berhasil diperbarui');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const changePasswordHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { old_password, new_password } = req.body;

    await UserService.changePassword({ id, old_password, new_password });

    return ok(res, null, 'Password berhasil diubah');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

module.exports = {
  getMeHandler,
  updateProfileHandler,
  updateAvatarHandler,
  changePasswordHandler,
};
