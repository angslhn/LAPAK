const SupplierDebtModel = require('../models/supplier_debt.model');
const SupplierModel = require('../models/supplier.model');
const CashLedgerModel = require('../models/cash_ledger.model');

const { getPool } = require('../lib/mysql');
const { getLocalDate } = require('../helpers/datetime');

const {
  SUPPLIER_NOT_FOUND,
  NOT_FOUND,
  VALIDATION_ERROR,
} = require('../helpers/error_codes');

const getAll = async (filters = {}) => {
  try {
    return await SupplierDebtModel.findAll(filters);
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (id) => {
  try {
    const debt = await SupplierDebtModel.findById(id);

    if (!debt) throw new Error(NOT_FOUND);

    return debt;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUpcoming = async (days = 7) => {
  try {
    return await SupplierDebtModel.getUpcomingDebts(days);
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAging = async () => {
  try {
    return await SupplierDebtModel.getAgingReport();
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { supplier_id, date, due_date, receipt_number, total, note } = data;

    const supplier = await SupplierModel.findById(supplier_id);
    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    if (total <= 0) throw new Error(VALIDATION_ERROR);

    await connection.beginTransaction();

    const debtId = await SupplierDebtModel.create(
      {
        supplier_id,
        receipt_number: receipt_number || null,
        date,
        due_date,
        total,
        paid: 0,
        remaining: total,
        note: note || null,
        status: 'unpaid',
      },
      connection
    );

    await connection.commit();

    return { id: debtId };
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const update = async (id, data) => {
  try {
    const debt = await SupplierDebtModel.findById(id);

    if (!debt) throw new Error(NOT_FOUND);

    const affectedRows = await SupplierDebtModel.update(id, data);

    if (affectedRows === 0) throw new Error(NOT_FOUND);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const remove = async (id) => {
  try {
    const debt = await SupplierDebtModel.findById(id);

    if (!debt) throw new Error(NOT_FOUND);

    const affectedRows = await SupplierDebtModel.remove(id);

    if (affectedRows === 0) throw new Error(NOT_FOUND);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getAll,
  getById,
  getUpcoming,
  getAging,
  create,
  update,
  remove,
};
