const ProductModel = require('../models/product.model');
const StockMutationModel = require('../models/stock_mutation.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');
const CashLedgerModel = require('../models/cash_ledger.model');

const { getPool } = require('../lib/mysql');
const { getLocalDate, getLocalDateTime } = require('../helpers/datetime');
const { makeInvoiceCode } = require('../helpers/invoice');

const {
  TRANSACTION_NOT_FOUND,
  VALIDATION_ERROR,
  PRODUCT_NOT_FOUND,
  PRODUCT_INSUFFICIENT_STOCK,
  TRANSACTION_ALREADY_CANCELLED,
} = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await TransactionModel.findAllWithCustomer();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (data) => {
  try {
    const { id } = data;

    const transaction = await TransactionModel.findWithItems(id);

    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    return transaction;
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { user_id, customer_id, payment_method, items } = data;

    if (items.length < 1) throw new Error(VALIDATION_ERROR);

    const transactionItems = await Promise.all(
      items.map(async ({ product_id, quantity }) => {
        const product = await ProductModel.findById(product_id);

        if (!product) throw new Error(PRODUCT_NOT_FOUND);

        if (product.stock < quantity)
          throw new Error(PRODUCT_INSUFFICIENT_STOCK);

        return {
          product_id,
          quantity,
          stock_before: product.stock,
          stock_after: product.stock - quantity,
          selling_price: product.selling_price,
          subtotal: product.selling_price * quantity,
        };
      })
    );

    const subtotal = transactionItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const discount = data.discount || 0;
    const tax = (subtotal - discount) * 0.11;
    const total = subtotal - discount + tax;

    await connection.beginTransaction();

    const nextSeq = await TransactionModel.getNextInvoiceSequence(connection);

    const invoice_number = makeInvoiceCode(nextSeq);

    const transactionId = await TransactionModel.create(
      {
        user_id,
        customer_id,
        invoice_number,
        date: getLocalDateTime(),
        discount,
        tax,
        total,
        payment_method,
        status: payment_method === 'credit' ? 'unpaid' : 'paid',
        due_date: payment_method === 'credit' ? data.due_date : null,
        note: data.note || null,
      },
      connection
    );

    for (const {
      product_id,
      quantity,
      stock_before,
      stock_after,
      selling_price,
      subtotal,
    } of transactionItems) {
      await TransactionItemModel.create(
        {
          transaction_id: transactionId,
          product_id,
          quantity,
          stock_before,
          stock_after,
          selling_price,
          subtotal,
        },
        connection
      );

      await ProductModel.updateStock(
        { id: product_id, quantity: -quantity },
        connection
      );

      await StockMutationModel.create(
        {
          product_id,
          type: 'out',
          source: 'transaction',
          quantity,
          stock_before,
          stock_after,
          reference_id: transactionId,
        },
        connection
      );
    }

    if (payment_method !== 'credit') {
      await CashLedgerModel.create(
        {
          date: getLocalDate(),
          type: 'income',
          category: 'sale',
          amount: total,
          reference_id: transactionId,
          reference_type: 'transaction',
          note: invoice_number,
        },
        connection
      );
    }

    await connection.commit();

    return transactionId;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const cancel = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { id } = data;

    const transaction = await TransactionModel.findWithItems(id);

    if (!transaction) throw new Error(TRANSACTION_NOT_FOUND);

    if (transaction.status === 'cancelled')
      throw new Error(TRANSACTION_ALREADY_CANCELLED);

    await connection.beginTransaction();

    const { invoice_number, items } = transaction;

    await TransactionModel.updateStatus(
      { id, status: 'cancelled' },
      connection
    );

    let total = 0;

    for (const { product_id, quantity } of items) {
      const product = await ProductModel.findById(product_id);

      const stock_before = product.stock;
      const stock_after = stock_before + quantity;

      await ProductModel.updateStock({ id: product_id, quantity }, connection);

      await StockMutationModel.create(
        {
          product_id,
          type: 'in',
          source: 'adjustment',
          quantity,
          stock_before,
          stock_after,
          reference_id: id,
          note: 'Pembatalan transaksi ' + invoice_number,
        },
        connection
      );

      total += product.selling_price * quantity;
    }

    if (transaction.status === 'paid') {
      await CashLedgerModel.create(
        {
          date: getLocalDate(),
          type: 'expense',
          category: 'sale',
          amount: total,
          reference_id: id,
          reference_type: 'transaction',
          note: 'Pembatalan ' + invoice_number,
        },
        connection
      );
    }

    await connection.commit();

    return id;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

module.exports = { getAll, getById, create, cancel };
