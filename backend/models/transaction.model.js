const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'customer_id',
  'user_id',
  'invoice_number',
  'date',
  'total',
  'payment_method',
  'status',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM transactions WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM transactions ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAllWithCustomer = async () => {
  try {
    const sql = `
                SELECT 
                  t.*,
                  c.name AS customer_name
                FROM transactions t
                LEFT JOIN customers c 
                  ON t.customer_id = c.id
                ORDER BY t.created_at DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findWithItems = async (id) => {
  try {
    const [transaction] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!transaction[0]) return null;

    const [items] = await pool.execute(
      'SELECT * FROM transaction_items WHERE transaction_id = ?',
      [id]
    );

    return { ...transaction[0], items };
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findUnpaidByCustomer = async (id) => {
  try {
    const sql = `
                SELECT * FROM transactions
                WHERE customer_id = ?
                AND status = 'unpaid'
                ORDER BY created_at DESC
                `;

    const [rows] = await pool.execute(sql, [id]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAllUnpaid = async () => {
  try {
    const sql = `
                SELECT
                  t.*,
                  c.name AS customer_name
                FROM transactions t
                LEFT JOIN customers c ON t.customer_id = c.id
                WHERE t.status = 'unpaid'
                ORDER BY t.created_at DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findRevenueByRange = async (from, to) => {
  try {
    const sql = `
                SELECT
                  DATE(date) AS date,
                  SUM(total) AS revenue
                FROM transactions
                WHERE date >= ? 
                  AND date < ? + INTERVAL 1 DAY
                  AND status = 'paid'
                GROUP BY DATE(date)
                ORDER BY DATE(date) ASC
                `;

    const [rows] = await pool.execute(sql, [from, to]);

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
    const sql = `INSERT INTO transactions (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumRevenueByDate = async (date) => {
  try {
    const sql = `
                SELECT SUM(total) AS total
                FROM transactions
                WHERE date >= ? 
                  AND date < ? + INTERVAL 1 DAY
                  AND status = 'paid'
                `;

    const [rows] = await pool.execute(sql, [date, date]);

    return Number(rows[0]?.total || 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumTodayRevenue = async () => {
  try {
    const sql = `
                SELECT SUM(total) AS total
                FROM transactions
                WHERE t.date >= CURDATE() 
                  AND t.date < CURDATE() + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0].total) || 0;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const countByDate = async (date) => {
  try {
    const sql = `
                SELECT COUNT(id) AS total
                FROM transactions
                WHERE t.date >= ? 
                  AND t.date < ? + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql, [date, date]);

    return Number(rows[0].total) || 0;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const countToday = async () => {
  try {
    const sql = `
                SELECT COUNT(id) AS total
                FROM transactions
                WHERE t.date >= CURDATE() 
                  AND t.date < CURDATE() + INTERVAL 1 DAY
                  AND t.status = 'paid'
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0].total) || 0;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const getNextInvoiceSequence = async (conn) => {
  try {
    const sql = `
                SELECT COUNT(id) + 1 AS next_seq
                FROM transactions
                WHERE DATE(date) = CURDATE()
                FOR UPDATE
                `;

    const [rows] = await conn.execute(sql);

    return Number(rows[0].next_seq) || 1;
  } catch (err) {
    throw new Error(`[INVOICE_SEQUENCE] ${err.message}`);
  }
};

const updateStatus = async ({ id, status }, conn = null) => {
  const db = conn || pool;

  const VALID_STATUS = ['paid', 'unpaid'];

  if (!VALID_STATUS.includes(status))
    throw new Error(`Invalid status: ${status}`);

  try {
    const sql = 'UPDATE transactions SET status = ? WHERE id = ?';

    const [result] = await db.execute(sql, [status, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findAll,
  findAllUnpaid,
  findWithItems,
  findUnpaidByCustomer,
  findAllWithCustomer,
  findRevenueByRange,
  create,
  sumTodayRevenue,
  sumRevenueByDate,
  countToday,
  countByDate,
  getNextInvoiceSequence,
  updateStatus,
};
