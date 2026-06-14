const UserModel = require('../models/user.model');

const bcrypt = require('bcryptjs');

const { cloudinary } = require('../lib/cloudinary');

const {
  USER_NOT_FOUND,
  AUTH_EMAIL_ALREADY_EXISTS,
  NO_IMAGE_PROVIDED,
  USER_INVALID_PASSWORD,
  USER_UPDATE_FAILED,
  USER_AVATAR_UPDATE_FAILED,
} = require('../helpers/error_codes');

const getMe = async (data) => {
  try {
    const { id } = data;

    const user = await UserModel.findById(id);

    if (!user) throw new Error(USER_NOT_FOUND);

    const { password, ...userData } = user;

    return userData;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateAvatar = async (data) => {
  try {
    const { user_id, file_buffer } = data;

    const user = await UserModel.findById(user_id);

    if (!user) throw new Error(USER_NOT_FOUND);

    if (!file_buffer) throw new Error(NO_IMAGE_PROVIDED);

    // Upload buffer ke Cloudinary
    const avatar_url = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'user_avatars',
            public_id: String(user_id),
            overwrite: true,
            transformation: [{ width: 512, height: 512, crop: 'fill' }],
          },
          (error, result) => {
            if (error) {
              console.error('[CLOUDINARY] Upload error:', error.message);

              return reject(error);
            }

            resolve(result.secure_url);
          }
        )
        .end(file_buffer);
    });

    const affectedRows = await UserModel.update({ id: user.id, avatar_url });

    if (affectedRows === 0) throw new Error(USER_AVATAR_UPDATE_FAILED);

    return { avatar_url };
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateProfile = async (data) => {
  try {
    const { id, name, email, phone, store_name, address } = data;

    const user = await UserModel.findById(id);

    if (!user) throw new Error(USER_NOT_FOUND);

    if (email && email !== user.email) {
      const existingUser = await UserModel.findByEmail(email);

      if (existingUser) throw new Error(AUTH_EMAIL_ALREADY_EXISTS);
    }

    const affectedRows = await UserModel.update({
      id,
      name,
      email,
      phone,
      store_name,
      address,
    });

    if (affectedRows === 0) throw new Error(USER_UPDATE_FAILED);

    const updatedUser = await UserModel.findById(id);

    const { password, ...userData } = updatedUser;

    return userData;
  } catch (err) {
    throw new Error(err.message);
  }
};

const changePassword = async (data) => {
  try {
    const { id, old_password, new_password } = data;

    const user = await UserModel.findById(id);

    if (!user) throw new Error(USER_NOT_FOUND);

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) throw new Error(USER_INVALID_PASSWORD);

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const affectedRows = await UserModel.update({
      id,
      password: hashedPassword,
    });

    if (affectedRows === 0) throw new Error(USER_UPDATE_FAILED);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getMe, updateProfile, updateAvatar, changePassword };
