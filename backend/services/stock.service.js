const ProductModel = require('../models/product.model');
const StockMutationModel = require('../models/stock_mutation.model');

const { getPool } = require('../lib/mysql');
const {
  PRODUCT_NOT_FOUND,
  PRODUCT_INSUFFICIENT_STOCK,
} = require('../helpers/errorCodes');

const getAll = async () => {
  try {
    const products = await ProductModel.findAllWithCategory();

    const stockItems = products.map(
      ({ id, name, category_name, stock, minimum_stock, unit }) => {
        let status;

        if (stock === 0) status = 'out';
        else if (stock <= minimum_stock) status = 'critical';
        else if (stock <= minimum_stock + 10) status = 'low';
        else status = 'ok';

        return {
          id,
          name,
          category_name,
          stock,
          minimum_stock,
          status,
          unit,
        };
      }
    );

    return {
      summary_metrics: {
        total_product: stockItems.length,
        low_stock: stockItems.filter((item) => item.status === 'low').length,
        critical_stock: stockItems.filter((item) => item.status === 'critical')
          .length,
      },
      stock_items: stockItems,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getLowStock = async () => {
  try {
    return await ProductModel.findLowStock();
  } catch (err) {
    throw new Error(err.message);
  }
};

const adjustStock = async (data) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { id, type, quantity, note } = data;

    const product = await ProductModel.findById(id);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    const stock_before = product.stock;

    const delta = type === 'in' ? quantity : -quantity;

    if (type === 'out' && stock_before < quantity)
      throw new Error(PRODUCT_INSUFFICIENT_STOCK);

    const stock_after = stock_before + delta;

    await connection.beginTransaction();

    await ProductModel.updateStock({ id, quantity: delta }, connection);

    await StockMutationModel.create(
      {
        product_id: id,
        type,
        source: 'adjustment',
        quantity,
        stock_before,
        stock_after,
        note,
      },
      connection
    );

    await connection.commit();

    return { stock_before, stock_after };
  } catch (err) {
    await connection.rollback();
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const getMutations = async () => {
  try {
    return await StockMutationModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getMutationsByProduct = async (data) => {
  try {
    const { productId } = data;

    const product = await ProductModel.findById(productId);

    if (!product) throw new Error(PRODUCT_NOT_FOUND);

    return await StockMutationModel.findByProduct(productId);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getAll,
  getLowStock,
  adjustStock,
  getMutations,
  getMutationsByProduct,
};
