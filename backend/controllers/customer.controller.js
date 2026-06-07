const CustomerService = require('../services/customer.service');

const { ok, error, created } = require('../helpers/response');

const { ERROR_MESSAGES } = require('../helpers/error_messages');
const { ERROR_STATUS } = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await CustomerService.getAll();

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
    const { name, phone } = req.body;

    const data = await CustomerService.create({ name, phone });

    return created(res, data);
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

const getReceivablesHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CustomerService.getReceivables({ id });

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

module.exports = { getAllHandler, createHandler, getReceivablesHandler };
