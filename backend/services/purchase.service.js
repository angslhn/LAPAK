const SupplierModel = require('../models/supplier.model');
const ProductModel = require('../models/product.model');
const PurchaseModel = require('../models/purchase.model');
const CashLedgerModel = require('../models/cash_ledger.model');
const PurchaseItemModel = require('../models/purchase_item.model');
const StockMutationModel = require('../models/stock_mutation.model');

import { getPool } from '../lib/mysql';
import { getLocalDate } from '../helpers/datetime';

const {
  PURCHASE_NOT_FOUND,
  VALIDATION_ERROR,
  SUPPLIER_NOT_FOUND,
  PURCHASE_ALREADY_PAID,
} = require('../helpers/errorCodes');

const getAll = async () => {
  try {
    return await PurchaseModel.findAllWithSupplier();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (data) => {
  try {
    const { id } = data;

    const purchase = PurchaseModel.findWithItems(id);

    if (!purchase) throw new Error(PURCHASE_NOT_FOUND);

    return purchase;
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { supplier_id, receipt_number, date, items } = data;

    if (items.length < 1) throw new Error(VALIDATION_ERROR);

    const supplier = await SupplierModel.findById(supplier_id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    const total = items.reduce(
      (sum, { purchase_price, quantity }) => sum + purchase_price * quantity,
      0
    );

    await connection.beginTransaction();

    const purchaseId = await PurchaseModel.create({
      supplier_id,
      receipt_number,
      date,
      total,
      status: 'unpaid',
    });

    for (const { product_id, quantity, purchase_price } of items) {
      const product = await ProductModel.findById(product_id);

      const stock_before = product.stock;
      const stock_after = stock_before + quantity;

      await PurchaseItemModel.create({
        purchase_id: purchaseId,
        product_id,
        quantity,
        purchase_price,
      });

      await ProductModel.updateStock({ id: product_id, quantity }, connection);

      await StockMutationModel.create(
        {
          product_id,
          type: 'in',
          source: 'purchase',
          quantity,
          stock_before,
          stock_after,
          reference_id: purchaseId,
        },
        connection
      );
    }

    await CashLedgerModel.create({
      date: getLocalDate(),
      type: 'expense',
      category: 'purchase',
      amount: total,
      reference_id: purchaseId,
      reference_type: 'purchase',
      note: receipt_number,
    });

    await connection.commit();

    return purchaseId;
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const getUnpaidTotal = async () => {
  try {
    return await PurchaseModel.sumUnpaidTotal();
  } catch (err) {
    throw new Error(err.message);
  }
};

const markAsPaid = async (data) => {
  try {
    const { id } = data;

    const purchase = await PurchaseModel.findById(id);

    if (!purchase) throw new Error(PURCHASE_NOT_FOUND);

    if (purchase.status === 'paid') throw new Error(PURCHASE_ALREADY_PAID);

    await PurchaseModel.updateStatus(id, 'paid');

    return id;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, getById, create, getUnpaidTotal, markAsPaid };
