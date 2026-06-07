const SupplierService = require('../services/supplier.service');

const { ok, error, created } = require('../helpers/response');

const { ERROR_MESSAGES } = require('../helpers/error_messages');
const { ERROR_STATUS } = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await SupplierService.getAll();

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

    const data = await SupplierService.getById({ id });

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
    const { name, phone, email, contact_person, address, note } = req.body;

    const data = await SupplierService.create({
      name,
      phone,
      email,
      contact_person,
      address,
      note,
    });

    return created(res, data, 'Supplier baru ditambahkan');
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
    const { name, phone, email, contact_person, address, note } = req.body;

    const data = await SupplierService.update({
      id,
      name,
      phone,
      email,
      contact_person,
      address,
      note,
    });

    return ok(res, data, 'Data supplier berhasil diperbarui');
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

    const data = await SupplierService.remove({ id });

    return ok(res, data, 'Supplier berhasil dihapus');
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
};

// getAllHandler         # tidak perlu data → panggil supplier.getAll
// getByIdHandler        # ambil id dari params → panggil supplier.getById
// createHandler         # ambil name, phone, email, contact_person, address, note dari body → panggil supplier.create
// updateHandler         # ambil id dari params + fields dari body → panggil supplier.update
// removeHandler         # ambil id dari params → panggil supplier.remove
