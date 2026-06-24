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

    await CashService.createIncome({ date, amount, note });

    return created(res, null, 'Pemasukan berhasil dicatat');
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

    await CashService.createExpense({ date, amount, note });

    return created(res, null, 'Pengeluaran berhasil dicatat');
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

const updateCashHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, note } = req.body;

    await CashService.updateCashTransaction({
      id,
      amount,
      category,
      date,
      note,
    });

    return ok(res, null, 'Transaksi berhasil diperbarui');
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

const deleteCashHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await CashService.deleteCashTransaction(id);

    return ok(res, null, 'Transaksi berhasil dihapus');
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

const withdrawHandler = async (req, res) => {
  try {
    const { id: user_id, role } = req.user;

    const { amount, note } = req.body;

    const result = await CashService.withdraw({
      amount,
      note,
      user_id,
    });

    return ok(res, result, 'Penarikan keuangan berhasil');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code] || err.message;
    const httpStatus = ERROR_STATUS[code] || 500;

    return error(res, code, message, httpStatus);
  }
};

module.exports = {
  getAllHandler,
  getByDateHandler,
  createIncomeHandler,
  createExpenseHandler,
  updateCashHandler,
  deleteCashHandler,
  withdrawHandler,
};
