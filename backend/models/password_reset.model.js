const { getPool } = require('../lib/mysql');

const sanitize = require('../helpers/sanitize');

const pool = getPool();

const ALLOWED_FIELDS = ['email', 'token', 'expired_at'];

const findByToken = async (token) => {
  try {
    const sql =
      'SELECT * FROM password_resets WHERE token = ? AND expired_at > NOW()';

    const [rows] = await pool.execute(sql, [token]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const create = async (data) => {
  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);

  try {
    const sql = `INSERT INTO password_resets (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await pool.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const remove = async (token) => {
  try {
    const sql = 'DELETE FROM password_resets WHERE token = ?';

    const [result] = await pool.execute(sql, [token]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = { findByToken, create, remove };
