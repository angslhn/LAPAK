const ProductService = require('../services/product.service');

const { ok, error, created } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await ProductService.getAll();

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

    const data = await ProductService.getById({ id });

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
    const payload = req.body;

    const file_buffer = req.file?.buffer || null;

    const data = await ProductService.create(payload, file_buffer);

    return created(res, data, 'Produk berhasil ditambahkan');
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

    const payload = req.body;

    const data = await ProductService.update({ id, ...payload });

    return ok(res, data, 'Produk berhasil diperbarui');
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

const updateImageHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const file_buffer = req.file?.buffer || null;

    const data = await ProductService.updateImage(id, file_buffer);

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

const removeHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await ProductService.remove(id);

    return ok(res, data, 'Produk berhasil dihapus');
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
  updateImageHandler,
  removeHandler,
};
