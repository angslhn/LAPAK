const PurchaseService = require('../services/purchase.service');

const { ok, error, created } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await PurchaseService.getAll();

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

    const data = await PurchaseService.getById({ id });

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
    const {
      supplier_id,
      date,
      due_date,
      items,
      note,
      payment_status = 'unpaid',
    } = req.body;

    const data = await PurchaseService.create({
      supplier_id,
      date,
      due_date,
      items,
      note,
      payment_status,
    });

    const message =
      payment_status === 'paid'
        ? 'Pembelian tunai berhasil disimpan'
        : 'Pembelian hutang berhasil disimpan';

    return created(res, data, message);
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

const markAsPaidHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await PurchaseService.markAsPaid({ id });

    return ok(res, null, 'Pembelian ditandai lunas');
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
  markAsPaidHandler,
};
