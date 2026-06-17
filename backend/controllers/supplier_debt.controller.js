const SupplierDebtService = require('../services/supplier_debt.service');

const { ok, error, created } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const { status, supplier_id } = req.query;

    const filters = {};

    if (status) filters.status = status;

    if (supplier_id) filters.supplier_id = supplier_id;

    const data = await SupplierDebtService.getAll(filters);

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

    const data = await SupplierDebtService.getById(id);

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

const getUpcomingHandler = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const data = await SupplierDebtService.getUpcoming(Number(days));

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

const getAgingHandler = async (req, res) => {
  try {
    const data = await SupplierDebtService.getAging();

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
    const { supplier_id, date, due_date, receipt_number, total, note } =
      req.body;

    const result = await SupplierDebtService.create({
      supplier_id,
      date,
      due_date,
      receipt_number,
      total,
      note,
    });

    return created(res, result, 'Hutang berhasil dicatat');
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
    const { supplier_id, due_date, note } = req.body;

    await SupplierDebtService.update(id, { supplier_id, due_date, note });

    return ok(res, null, 'Data hutang berhasil diperbarui');
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

    await SupplierDebtService.remove(id);

    return ok(res, null, 'Hutang berhasil dihapus');
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
  getUpcomingHandler,
  getAgingHandler,
  createHandler,
  updateHandler,
  removeHandler,
};
