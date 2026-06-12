const DebtService = require('../services/debt.service');

const { ok, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getCustomerDebtsHandler = async (req, res) => {
  try {
    const data = await DebtService.getCustomerDebts();

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

const payCustomerDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await DebtService.payCustomerDebt({ id });

    return ok(res, null, 'Piutang berhasil dibayar');
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

const getSupplierDebtsHandler = async (req, res) => {
  try {
    const data = await DebtService.getSupplierDebts();

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

const paySupplierDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await DebtService.paySupplierDebt({ id });

    return ok(res, null, 'Hutang berhasil dibayar');
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
  getCustomerDebtsHandler,
  payCustomerDebtHandler,
  getSupplierDebtsHandler,
  paySupplierDebtHandler,
};
