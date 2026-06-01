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
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions ORDER BY created_at DESC'
    );

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

const create = async (data) => {
  const fields = Object.keys(data).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => data[field]);

  try {
    const [result] = await pool.execute(
      `INSERT INTO transactions (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values
    );

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const updateStatus = async (id, status) => {
  const VALID_STATUS = ['paid', 'unpaid'];

  if (!VALID_STATUS.includes(status))
    throw new Error(`Invalid status: ${status}`);

  try {
    const sql = 'UPDATE transactions SET status = ? WHERE id = ?';

    const [result] = await pool.execute(sql, [status, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};
