const DebtService = require('../services/debt.service');

const { ok, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

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
    const { payment_amount, payment_method, note } = req.body;

    const result = await DebtService.paySupplierDebt({
      id,
      payment_amount,
      payment_method,
      note,
    });

    const message =
      result.status === 'paid'
        ? 'Hutang berhasil dilunasi'
        : 'Pembayaran hutang berhasil';

    return ok(res, result, message);
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

const updateSupplierDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, due_date, note } = req.body;

    await DebtService.updateSupplierDebt({ id, supplier_id, due_date, note });

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

const deleteSupplierDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await DebtService.deleteSupplierDebt(id);

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
    const { payment_amount, payment_date, payment_method, note } = req.body;

    const result = await DebtService.payCustomerDebt(id, {
      payment_amount,
      payment_date,
      payment_method,
      note,
    });

    return ok(res, result, 'Pembayaran piutang berhasil');
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

const updateCustomerDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, due_date, note } = req.body;

    await DebtService.updateCustomerDebt(id, {
      customer_name,
      customer_phone,
      due_date,
      note,
    });

    return ok(res, null, 'Data piutang berhasil diperbarui');
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

const deleteCustomerDebtHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await DebtService.deleteCustomerDebt(id);

    return ok(res, null, 'Piutang berhasil dihapus');
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
  updateCustomerDebtHandler,
  deleteCustomerDebtHandler,
  getSupplierDebtsHandler,
  paySupplierDebtHandler,
  updateSupplierDebtHandler,
  deleteSupplierDebtHandler,
};
