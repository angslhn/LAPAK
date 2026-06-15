const { getPool } = require('../lib/mysql');

const sanitize = require('../helpers/sanitize');

const ALLOWED_FIELDS = [
  'name',
  'phone',
  'email',
  'contact_person',
  'address',
  'note',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM suppliers WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM suppliers';

    const [rows] = await pool.execute(sql);

    return rows;
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

  const values = fields.map((field) => data[field]);

  try {
    const sql = `INSERT INTO suppliers (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

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
    const sql = `UPDATE suppliers SET ${placeholder} WHERE id = ?`;

    const [result] = await pool.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM suppliers WHERE id = ?';

    const [result] = await pool.execute(sql, [id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = { findById, findAll, create, update, remove };
