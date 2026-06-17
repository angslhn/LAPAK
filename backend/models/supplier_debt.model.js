const { getPool } = require('../lib/mysql');

const sanitize = require('../helpers/sanitize');

const ALLOWED_FIELDS = [
  'purchase_id',
  'supplier_id',
  'receipt_number',
  'date',
  'due_date',
  'total',
  'paid',
  'remaining',
  'note',
  'status',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = `
      SELECT 
        sd.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone
      FROM supplier_debts sd
      LEFT JOIN suppliers s ON sd.supplier_id = s.id
      WHERE sd.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findByPurchaseId = async (purchaseId) => {
  try {
    const sql = 'SELECT * FROM supplier_debts WHERE purchase_id = ?';

    const [rows] = await pool.execute(sql, [purchaseId]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async (filters = {}) => {
  try {
    let sql = `
      SELECT 
        sd.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone
      FROM supplier_debts sd
      LEFT JOIN suppliers s ON sd.supplier_id = s.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        sql += ` AND sd.status IN (${filters.status.map(() => '?').join(', ')})`;
        values.push(...filters.status);
      } else {
        sql += ' AND sd.status = ?';
        values.push(filters.status);
      }
    }

    if (filters.supplier_id) {
      sql += ' AND sd.supplier_id = ?';
      values.push(filters.supplier_id);
    }

    sql += ' ORDER BY sd.due_date ASC, sd.created_at DESC';

    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const create = async (data, conn = null) => {
  const db = conn || pool;

  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);

  try {
    const sql = `INSERT INTO supplier_debts (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const update = async (id, data, conn = null) => {
  const db = conn || pool;

  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter(
    (field) => ALLOWED_FIELDS.includes(field) && field !== 'id'
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);
  const placeholders = fields.map((field) => `${field} = ?`).join(', ');

  try {
    const sql = `UPDATE supplier_debts SET ${placeholders} WHERE id = ?`;

    const [result] = await db.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM supplier_debts WHERE id = ?';

    const [result] = await pool.execute(sql, [id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const getUpcomingDebts = async (days = 7) => {
  try {
    const sql = `
      SELECT 
        sd.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone
      FROM supplier_debts sd
      LEFT JOIN suppliers s ON sd.supplier_id = s.id
      WHERE sd.status IN ('unpaid', 'partial')
        AND sd.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY sd.due_date ASC
    `;

    const [rows] = await pool.execute(sql, [days]);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const getAgingReport = async () => {
  try {
    const sql = `
      SELECT 
        sd.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone,
        CASE 
          WHEN sd.due_date < CURDATE() THEN DATEDIFF(CURDATE(), sd.due_date)
          ELSE 0
        END AS days_overdue,
        CASE 
          WHEN sd.due_date >= CURDATE() THEN 'Belum Jatuh Tempo'
          WHEN sd.due_date < CURDATE() AND DATEDIFF(CURDATE(), sd.due_date) <= 30 THEN 'Lewat Jatuh Tempo 1-30 hari'
          WHEN sd.due_date < CURDATE() AND DATEDIFF(CURDATE(), sd.due_date) <= 60 THEN 'Lewat Jatuh Tempo 31-60 hari'
          ELSE 'Lewat Jatuh Tempo >60 hari'
        END AS aging_status
      FROM supplier_debts sd
      LEFT JOIN suppliers s ON sd.supplier_id = s.id
      WHERE sd.status IN ('unpaid', 'partial')
      ORDER BY sd.due_date ASC
    `;
    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findByPurchaseId,
  findAll,
  create,
  update,
  remove,
  getUpcomingDebts,
  getAgingReport,
};
