const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'purchase_id',
  'product_id',
  'quantity',
  'purchase_price',
];

const pool = getPool();

const create = async (data) => {
  const fields = Object.keys(data).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => data[field]);

  try {
    const [result] = await pool.execute(
      `INSERT INTO purchase_items (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values
    );

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByPurchase = async (id) => {
  try {
    const sql = 'SELECT * FROM purchase_items WHERE purchase_id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};
