const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'transaction_id',
  'product_id',
  'quantity',
  'selling_price',
  'subtotal',
];

const pool = getPool();

const findByTransaction = async (id) => {
  try {
    const sql = 'SELECT * FROM transaction_items WHERE transaction_id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findTopProducts = async (limit) => {
  try {
    const sql = `
                SELECT
                  p.id,
                  p.name,
                  SUM(ti.quantity) AS total_qty,
                  SUM(ti.subtotal) AS total_revenue
                FROM transaction_items ti
                JOIN products p ON ti.product_id = p.id
                GROUP BY p.id, p.name
                ORDER BY total_qty DESC
                LIMIT ?
                `;

    const [rows] = await pool.execute(sql, [limit]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findRevenueByCategory = async () => {
  try {
    const sql = `
                SELECT
                  c.id,
                  c.name AS category_name,
                  SUM(ti.subtotal) AS total_revenue
                FROM transaction_items ti
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                GROUP BY c.id, c.name
                ORDER BY total_revenue DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const create = async (data) => {
  const fields = Object.keys(data).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => data[field]);

  try {
    const sql = `INSERT INTO transaction_items (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await pool.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumTodayHPP = async () => {
  try {
    const sql = `
                SELECT
                  SUM(ti.quantity * p.purchase_price) AS total
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                JOIN products p ON ti.product_id = p.id
                WHERE DATE(t.date) = CURDATE()
                AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0].total ?? 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findByTransaction,
  findTopProducts,
  findRevenueByCategory,
  create,
  sumTodayHPP,
};
