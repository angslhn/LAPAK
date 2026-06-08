const CashService = require('../services/cash.service');

const { ok, error, created } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await CashService.getAll();

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

const getByDateHandler = async (req, res) => {
  try {
    const { date } = req.query;

    const data = await CashService.getByDate({ date });

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

const createIncomeHandler = async (req, res) => {
  try {
    const { date, amount, note } = req.body;

    const data = await CashService.createIncome({ date, amount, note });

    return created(res, data, 'Pemasukan berhasil dicatat');
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

const createExpenseHandler = async (req, res) => {
  try {
    const { date, amount, note } = req.body;

    const data = await CashService.createExpense({ date, amount, note });

    return created(res, data, 'Pengeluaran berhasil dicatat');
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
  getByDateHandler,
  createIncomeHandler,
  createExpenseHandler,
};
