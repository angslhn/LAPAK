const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'name',
  'email',
  'password',
  'phone',
  'store_name',
  'address',
  'avatar_url',
  'role',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM users WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByEmail = async (email) => {
  try {
    const sql = 'SELECT * FROM users WHERE email = ?';

    const [rows] = await pool.execute(sql, [email]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users');

    return rows;
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
    const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await pool.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const update = async (data) => {
  const { id, ...newData } = data;

  const fields = Object.keys(newData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => newData[field]);
  const placeholder = fields.map((field) => `${field} = ?`).join(', ');

  try {
    const sql = `UPDATE users SET ${placeholder} WHERE id = ?`;

    const [result] = await pool.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM users WHERE id = ?';

    const [result] = await pool.execute(sql, [id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findByEmail,
  findAll,
  create,
  update,
  remove,
};
