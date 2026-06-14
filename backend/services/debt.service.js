const CashLedgerModel = require('../models/cash_ledger.model');
const PurchaseModel = require('../models/purchase.model');
const TransactionModel = require('../models/transaction.model');

const { getPool } = require('../lib/mysql');
const { getLocalDate } = require('../helpers/datetime');

const {
  TRANSACTION_NOT_FOUND,
  DEBT_CUSTOMER_ALREADY_CANCELLED,
  DEBT_CUSTOMER_ALREADY_PAID,
  DEBT_SUPPLIER_ALREADY_PAID,
  PURCHASE_NOT_FOUND,
} = require('../helpers/error_codes');

const getCustomerDebts = async () => {
  try {
    const transactions = await TransactionModel.findAllUnpaid();

    const debts = transactions.reduce((acc, transaction) => {
      const customerId = transaction.customer_id;

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          customer_name: transaction.customer_name,
          total_debt: 0,
          transactions: [],
        };
      }

      acc[customerId].total_debt += transaction.total;
      acc[customerId].transactions.push(transaction);

      return acc;
    }, {});

    return Object.values(debts);
  } catch (err) {
    throw new Error(err.message);
  }
};

const payCustomerDebt = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { id } = data;

    const transaction = await TransactionModel.findById(id);

    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    if (transaction.status === 'cancelled')
      throw new Error(DEBT_CUSTOMER_ALREADY_CANCELLED);

    if (transaction.status === 'paid')
      throw new Error(DEBT_CUSTOMER_ALREADY_PAID);

    await connection.beginTransaction();

    await TransactionModel.updateStatus({ id, status: 'paid' }, connection);

    const cashLedgerId = await CashLedgerModel.create(
      {
        date: getLocalDate(),
        type: 'income',
        category: 'credit_payment',
        amount: transaction.total,
        reference_id: id,
        reference_type: 'transaction',
        note: 'Pelunasan piutang dari ' + transaction.invoice_number,
      },
      connection
    );

    await connection.commit();

    return cashLedgerId;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const getSupplierDebts = async () => {
  try {
    return await PurchaseModel.findAllUnpaid();
  } catch (err) {
    throw new Error(err.message);
  }
};

const paySupplierDebt = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { id } = data;

    const purchase = await PurchaseModel.findById(id);

    if (!purchase) throw new Error(PURCHASE_NOT_FOUND);

    if (purchase.status === 'paid') throw new Error(DEBT_SUPPLIER_ALREADY_PAID);

    await connection.beginTransaction();

    await PurchaseModel.updateStatus({ id, status: 'paid' }, connection);

    const cashLedgerId = await CashLedgerModel.create(
      {
        date: getLocalDate(),
        type: 'expense',
        category: 'purchase',
        amount: purchase.total,
        reference_id: id,
        reference_type: 'purchase',
        note: 'Pelunasan hutang dari ' + purchase.receipt_number,
      },
      connection
    );

    await connection.commit();

    return cashLedgerId;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  getCustomerDebts,
  payCustomerDebt,
  getSupplierDebts,
  paySupplierDebt,
};
