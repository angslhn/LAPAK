const SupplierDebtModel = require('../models/supplier_debt.model');
const PurchaseModel = require('../models/purchase.model');
const CashLedgerModel = require('../models/cash_ledger.model');
const CustomerModel = require('../models/customer.model');
const TransactionModel = require('../models/transaction.model');

const { getPool } = require('../lib/mysql');
const { getLocalDate } = require('../helpers/datetime');

const {
  NOT_FOUND,
  TRANSACTION_NOT_FOUND,
  DEBT_CUSTOMER_ALREADY_CANCELLED,
  DEBT_CUSTOMER_ALREADY_PAID,
  DEBT_SUPPLIER_ALREADY_PAID,
  PURCHASE_NOT_FOUND,
} = require('../helpers/error_codes');

const getSupplierDebts = async () => {
  try {
    const debts = await SupplierDebtModel.findAll({
      status: ['unpaid', 'partial'],
    });

    return debts.map((debt) => ({
      id: debt.id,
      purchase_id: debt.purchase_id,
      supplier_id: debt.supplier_id,
      supplier_name: debt.supplier_name,
      supplier_phone: debt.supplier_phone,
      receipt_number: debt.receipt_number,
      date: debt.date,
      due_date: debt.due_date,
      total: debt.total,
      paid: debt.paid,
      remaining: debt.remaining,
      note: debt.note,
      status: debt.status,
      created_at: debt.created_at,
      updated_at: debt.updated_at,
    }));
  } catch (err) {
    throw new Error(err.message);
  }
};

const paySupplierDebt = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { id, payment_amount, payment_method, note } = data;

    const debt = await SupplierDebtModel.findById(id);

    if (!debt) throw new Error(NOT_FOUND);

    if (debt.remaining <= 0) throw new Error(DEBT_SUPPLIER_ALREADY_PAID);

    if (payment_amount > debt.remaining) {
      throw new Error(
        `Pembayaran melebihi sisa hutang (sisa: ${debt.remaining})`
      );
    }

    const newPaid = debt.paid + payment_amount;
    const newRemaining = debt.remaining - payment_amount;
    const newStatus = newRemaining === 0 ? 'paid' : 'partial';

    await connection.beginTransaction();

    await SupplierDebtModel.update(id, {
      paid: newPaid,
      remaining: newRemaining,
      status: newStatus,
    });

    if (debt.purchase_id) {
      await PurchaseModel.updateStatus({
        id: debt.purchase_id,
        status: newStatus === 'paid' ? 'paid' : 'unpaid',
      });
    }

    await CashLedgerModel.create(
      {
        date: getLocalDate(),
        type: 'expense',
        category: 'purchase',
        amount: payment_amount,
        reference_id: debt.purchase_id || id,
        reference_type: debt.purchase_id ? 'purchase' : 'manual',
        note: `Pembayaran hutang ${debt.receipt_number}`,
      },
      connection
    );

    await connection.commit();

    return {
      id: debt.id,
      paid: newPaid,
      remaining: newRemaining,
      status: newStatus,
    };
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const updateSupplierDebt = async (data) => {
  const { id } = data;

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

const deleteSupplierDebt = async (id) => {
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

const getCustomerDebts = async () => {
  try {
    const transactions = await TransactionModel.findAllUnpaid();

    const debts = transactions.reduce((acc, transaction) => {
      const customerId = transaction.customer_id;

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          customer_name: transaction.customer_name,
          customer_phone: transaction.customer_phone || null,
          customer_address: transaction.customer_address || null,
          total_debt: 0,
          transactions: [],
        };
      }

      const paid = transaction.paid || 0;
      const remaining = transaction.total - paid;

      acc[customerId].total_debt += remaining;
      acc[customerId].transactions.push({
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        date: transaction.date,
        total: transaction.total,
        due_date: transaction.due_date,
        paid: paid,
        remaining: remaining,
        status: transaction.status,
      });

      return acc;
    }, {});

    return Object.values(debts);
  } catch (err) {
    throw new Error(err.message);
  }
};

const payCustomerDebt = async (transactionId, paymentData) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { payment_amount, payment_date, payment_method, note } = paymentData;

    const transaction = await TransactionModel.findById(transactionId);

    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    if (transaction.status === 'cancelled')
      throw new Error(DEBT_CUSTOMER_ALREADY_CANCELLED);

    if (transaction.status === 'paid')
      throw new Error(DEBT_CUSTOMER_ALREADY_PAID);

    const paidSoFar = transaction.paid || 0;
    const remaining = transaction.remaining || transaction.total - paidSoFar;

    if (payment_amount > remaining) {
      throw new Error(`Pembayaran melebihi sisa piutang (sisa: ${remaining})`);
    }

    const newPaid = paidSoFar + payment_amount;
    const newRemaining = remaining - payment_amount;
    const newStatus = newRemaining === 0 ? 'paid' : 'unpaid';

    await connection.beginTransaction();

    await TransactionModel.update(
      {
        id: transactionId,
        paid: newPaid,
        remaining: newRemaining,
        status: newStatus,
      },
      connection
    );

    await CashLedgerModel.create(
      {
        date: payment_date || getLocalDate(),
        type: 'income',
        category: 'credit_payment',
        amount: payment_amount,
        reference_id: transactionId,
        reference_type: 'transaction',
        note: note || `Pembayaran piutang dari ${transaction.invoice_number}`,
      },
      connection
    );

    await connection.commit();

    return {
      paid: newPaid,
      remaining: newRemaining,
      status: newStatus,
    };
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const updateCustomerDebt = async (transactionId, data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { customer_name, customer_phone, due_date, note } = data;

    const transaction = await TransactionModel.findById(transactionId);

    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    let customerId = transaction.customer_id;

    await connection.beginTransaction();

    if (customerId) {
      await CustomerModel.update({
        id: customerId,
        name: customer_name,
        phone: customer_phone || null,
      });
    } else {
      const newCustomerId = await CustomerModel.create({
        name: customer_name,
        phone: customer_phone || null,
      });
      customerId = newCustomerId;

      await TransactionModel.update(
        { id: transactionId, customer_id: customerId },
        connection
      );
    }

    await TransactionModel.update({
      id: transactionId,
      due_date,
      note,
    });

    await connection.commit();

    return true;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const deleteCustomerDebt = async (transactionId) => {
  try {
    const transaction = await TransactionModel.findById(transactionId);
    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    if (transaction.status === 'paid') {
      throw new Error('Tidak dapat menghapus transaksi yang sudah lunas');
    }

    const affectedRows = await TransactionModel.updateStatus({
      id: transactionId,
      status: 'cancelled',
    });

    if (affectedRows === 0) throw new Error(NOT_FOUND);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getSupplierDebts,
  paySupplierDebt,
  updateSupplierDebt,
  deleteSupplierDebt,
  getCustomerDebts,
  payCustomerDebt,
  updateCustomerDebt,
  deleteCustomerDebt,
};
