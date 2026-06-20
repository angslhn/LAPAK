const { getPool } = require('../lib/mysql');

const sanitize = require('../helpers/sanitize');

const ALLOWED_FIELDS = [
  'bank_name',
  'account_number',
  'account_owner',
  'is_active',
];

const pool = getPool();

const findAll = async (activeOnly = false) => {
  try {
    let sql = 'SELECT * FROM bank_accounts';

    if (activeOnly) {
      sql += ' WHERE is_active = TRUE';
    }

    sql += ' ORDER BY id DESC';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM bank_accounts WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

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
    const sql = `INSERT INTO bank_accounts (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await pool.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const update = async (id, data) => {
  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);
  const placeholders = fields.map((field) => `${field} = ?`).join(', ');

  try {
    const sql = `UPDATE bank_accounts SET ${placeholders} WHERE id = ?`;

    const [result] = await pool.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM bank_accounts WHERE id = ?';

    const [result] = await pool.execute(sql, [id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findActive = async () => {
  try {
    const sql = 'SELECT * FROM bank_accounts WHERE is_active = TRUE LIMIT 1';

    const [rows] = await pool.execute(sql);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findAll,
  findById,
  findActive,
  create,
  update,
  remove,
};
