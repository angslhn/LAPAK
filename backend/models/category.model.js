const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = ['name'];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM categories WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByName = async (name) => {
  try {
    const sql = 'SELECT * FROM categories WHERE name = ?';

    const [rows] = await pool.execute(sql, [name]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM categories';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAllWithTotalProduct = async () => {
  try {
    const sql = `
                SELECT 
                  c.id, 
                  c.name, 
                  COUNT(p.id) AS product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                GROUP BY c.id, c.name
                `;

    const [rows] = await pool.execute(sql);

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
    const sql = `INSERT INTO categories (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

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
    const sql = `UPDATE categories SET ${placeholder} WHERE id = ?`;

    const [result] = await pool.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findByName,
  findAll,
  findAllWithTotalProduct,
  create,
  update,
};
