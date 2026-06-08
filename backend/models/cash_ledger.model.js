const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'date',
  'type',
  'category',
  'note',
  'amount',
  'reference_id',
  'reference_type',
];

const pool = getPool();

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM cash_ledger ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByDate = async (date) => {
  try {
    const sql =
      'SELECT * FROM cash_ledger WHERE date = ? ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql, [date]);

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
    const sql = `INSERT INTO cash_ledger (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumByType = async (date) => {
  try {
    const sql = `
                SELECT
                  type,
                  SUM(amount) AS total
                FROM cash_ledger
                WHERE date = ?
                GROUP BY type
                `;

    const [rows] = await pool.execute(sql, [date]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumExpensesByRange = async (from, to) => {
  try {
    const sql = `
                SELECT
                  DATE(date) AS date,
                  SUM(amount) AS total
                FROM cash_ledger
                WHERE date >= ? 
                  AND date < DATE_ADD(?, INTERVAL 1 DAY)
                  AND type = 'expense'
                GROUP BY DATE(date)
                ORDER BY DATE(date) ASC
                `;

    const [rows] = await pool.execute(sql, [from, to]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = { findAll, findByDate, create, sumByType, sumExpensesByRange };
