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

const findTopProductsToday = async (limit = 5) => {
  try {
    const sql = `
                SELECT
                  p.id,
                  p.name,
                  c.name AS category,
                  SUM(ti.quantity) AS qty_sold,
                  SUM(ti.subtotal) AS total_revenue
                FROM transaction_items ti
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN transactions t ON ti.transaction_id = t.id
                WHERE t.date >= CURDATE() 
                  AND t.date < CURDATE() + INTERVAL 1 DAY
                  AND t.status = 'paid'
                GROUP BY p.id, p.name, c.name
                ORDER BY qty_sold DESC
                LIMIT ?
                `;

    const [rows] = await pool.execute(sql, [limit]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findTopProductsByRange = async (from, to, limit = 5) => {
  try {
    const sql = `
                SELECT
                  p.id,
                  p.name,
                  p.sku,
                  c.name AS category,
                  SUM(ti.quantity) AS qty_sold,
                  SUM(ti.subtotal) AS total_revenue
                FROM transaction_items ti
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN transactions t ON ti.transaction_id = t.id
                WHERE t.date >= ? 
                  AND t.date < DATE_ADD(?, INTERVAL 1 DAY)
                  AND t.status = 'paid'
                GROUP BY p.id, p.name, c.name
                ORDER BY qty_sold DESC
                LIMIT ?
                `;

    const [rows] = await pool.execute(sql, [from, to, limit]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findTopProductsAllTime = async (limit = 5) => {
  try {
    const sql = `
                SELECT
                  p.id,
                  p.name,
                  p.sku,
                  c.name AS category,
                  SUM(ti.quantity) AS qty_sold,
                  SUM(ti.subtotal) AS total_revenue
                FROM transaction_items ti
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN transactions t ON ti.transaction_id = t.id
                WHERE t.status = 'paid'
                GROUP BY p.id, p.name, c.name
                ORDER BY qty_sold DESC
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
                  SUM(ti.subtotal) AS total
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE t.status = 'paid'
                GROUP BY c.id, c.name
                ORDER BY total DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const create = async (data, conn = null) => {
  const db = conn || pool;

  const fields = Object.keys(data).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => data[field]);

  try {
    const sql = `INSERT INTO transaction_items (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumQuantityByCategory = async () => {
  try {
    const sql = `
                SELECT
                  c.id,
                  c.name AS category_name,
                  SUM(ti.quantity) AS total_quantity
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                JOIN products p ON ti.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE t.status = 'paid'
                GROUP BY c.id, c.name
                ORDER BY total_quantity DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumQuantityByDate = async (date) => {
  try {
    const sql = `
                SELECT 
                  SUM(ti.quantity) AS total 
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id 
                WHERE t.date >= ? 
                  AND t.date < ? + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql, [date, date]);

    return Number(rows[0]?.total || 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumTodayQuantity = async () => {
  try {
    const sql = `
                SELECT 
                  SUM(ti.quantity) AS total 
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id 
                WHERE t.date >= CURDATE() 
                  AND t.date < CURDATE() + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0]?.total || 0);
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
                WHERE t.date >= CURDATE() 
                  AND t.date < CURDATE() + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0].total ?? 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumHPPByRange = async (from, to) => {
  try {
    const sql = `
                SELECT
                  DATE(t.date) AS date,
                  SUM(ti.quantity * p.purchase_price) AS total
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                JOIN products p ON ti.product_id = p.id
                WHERE t.date >= ? 
                  AND t.date < DATE_ADD(?, INTERVAL 1 DAY)
                  AND t.status = 'paid'
                GROUP BY DATE(t.date)
                ORDER BY DATE(t.date) ASC
                `;

    const [rows] = await pool.execute(sql, [from, to]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findByTransaction,
  findTopProductsToday,
  findTopProductsByRange,
  findTopProductsAllTime,
  findRevenueByCategory,
  create,
  sumTodayHPP,
  sumHPPByRange,
  sumTodayQuantity,
  sumQuantityByCategory,
  sumQuantityByDate,
};
