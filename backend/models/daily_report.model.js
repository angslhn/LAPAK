const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'date',
  'total_revenue',
  'total_expenses',
  'gross_profit',
  'opening_balance',
  'closing_balance',
  'status',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM daily_reports WHERE id = ?',
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
      'SELECT * FROM daily_reports ORDER BY date DESC'
    );

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByDate = async (date) => {
  try {
    const sql = 'SELECT * FROM daily_reports WHERE date = ?';

    const [rows] = await pool.execute(sql, [date]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findToday = async () => {
  try {
    const sql = 'SELECT * FROM daily_reports WHERE date = CURDATE()';

    const [rows] = await pool.execute(sql);

    return rows[0] ?? null;
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
      `INSERT INTO daily_reports (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values
    );

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const closeReport = async (id, userId) => {
  try {
    const sql = `
                UPDATE 
                daily_reports 
                SET 
                  status = 'closed', 
                  closed_by = ?, 
                  closed_at = NOW()
                WHERE id = ?
                `;

    const [result] = await pool.execute(sql, [userId, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findAll,
  findByDate,
  findToday,
  create,
  closeReport,
};
