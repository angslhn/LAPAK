const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'product_id',
  'type',
  'source',
  'quantity',
  'stock_before',
  'stock_after',
  'reference_id',
  'note',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM stock_mutations WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM stock_mutations ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByProduct = async (id) => {
  try {
    const sql =
      'SELECT * FROM stock_mutations WHERE product_id = ? ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql, [id]);

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
    const sql = `INSERT INTO stock_mutations (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = { findById, findAll, findByProduct, create };
