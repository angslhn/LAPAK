const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'transaction_id',
  'product_id',
  'quantity',
  'selling_price',
  'subtotal',
];

const pool = getPool();

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

const findByTransaction = async (id) => {
  try {
    const sql = 'SELECT * FROM transaction_items WHERE transaction_id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};
