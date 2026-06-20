const BankAccountService = require('../services/bank_account.service');

const { ok, error, created } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const { active } = req.query;

    const data = await BankAccountService.getAll(active === 'true');

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

const getByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await BankAccountService.getById(id);

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

const createHandler = async (req, res) => {
  try {
    const { bank_name, account_number, account_owner } = req.body;

    const data = await BankAccountService.create({
      bank_name,
      account_number,
      account_owner,
    });

    return created(res, data, 'Bank berhasil ditambahkan');
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

const updateHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_number, account_owner, is_active } = req.body;

    await BankAccountService.update(id, {
      bank_name,
      account_number,
      account_owner,
      is_active,
    });

    return ok(res, null, 'Bank berhasil diperbarui');
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

const removeHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await BankAccountService.remove(id);

    return ok(res, null, 'Bank berhasil dihapus');
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

const getQRISHandler = async (req, res) => {
  try {
    const data = await BankAccountService.getQRIS();

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

const uploadQRISHandler = async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer || null;

    if (!fileBuffer) {
      return error(res, 'NO_IMAGE_PROVIDED', 'Gambar tidak ditemukan', 400);
    }

    const data = await BankAccountService.uploadQRIS(fileBuffer);

    return ok(res, data, 'QRIS berhasil diunggah');
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

const deleteQRISHandler = async (req, res) => {
  try {
    await BankAccountService.deleteQRIS();

    return ok(res, null, 'QRIS berhasil dihapus');
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
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  removeHandler,
  getQRISHandler,
  uploadQRISHandler,
  deleteQRISHandler,
};
