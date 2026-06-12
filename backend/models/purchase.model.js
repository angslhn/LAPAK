const { getPool } = require('../lib/mysql');

const ALLOWED_FIELDS = [
  'supplier_id',
  'receipt_number',
  'date',
  'due_date',
  'total',
  'status',
];

const pool = getPool();

const findById = async (id) => {
  try {
    const sql = 'SELECT * FROM purchases WHERE id = ?';

    const [rows] = await pool.execute(sql, [id]);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAll = async () => {
  try {
    const sql = 'SELECT * FROM purchases ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAllUnpaid = async () => {
  try {
    const sql = `
                SELECT 
                  p.*, 
                  s.name AS supplier_name
                FROM purchases p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.status = 'unpaid'
                ORDER BY p.created_at DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findAllWithSupplier = async () => {
  try {
    const sql = `
                SELECT
                  p.*, 
                  s.name AS supplier_name,
                  s.phone AS supplier_phone
                FROM purchases p 
                LEFT JOIN suppliers s 
                  ON p.supplier_id = s.id
                ORDER BY p.created_at DESC
                `;

    const [rows] = await pool.execute(sql);

    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findWithItems = async (id) => {
  try {
    const [purchase] = await pool.execute(
      'SELECT * FROM purchases WHERE id = ?',
      [id]
    );

    if (!purchase[0]) return null;

    const [items] = await pool.execute(
      'SELECT * FROM purchase_items WHERE purchase_id = ?',
      [id]
    );

    return { ...purchase[0], items };
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const getNextReceiptSequence = async (conn) => {
  try {
    const sql = `
                SELECT COUNT(id) + 1 AS next_seq
                FROM purchases
                WHERE DATE(date) = CURDATE()
                FOR UPDATE
                `;

    const [rows] = await conn.execute(sql);

    return Number(rows[0].next_seq) || 1;
  } catch (err) {
    throw new Error(`[RECEIPT_NUMBER_SEQUENCE] ${err.message}`);
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
    const sql = `INSERT INTO purchases (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    const [result] = await db.execute(sql, values);

    return result.insertId;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumUnpaidTotal = async () => {
  try {
    const sql =
      'SELECT SUM(total) AS total FROM purchases WHERE status = "unpaid"';

    const [rows] = await pool.execute(sql);

    return Number(rows[0]?.total || 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const sumPurchaseByCurrentMonth = async () => {
  try {
    const sql = `
                SELECT SUM(total) AS total
                FROM purchases
                WHERE YEAR(date) = YEAR(CURDATE()) 
                  AND MONTH(date) = MONTH(CURDATE())
                `;

    const [rows] = await pool.execute(sql);

    return Number(rows[0]?.total || 0);
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const updateStatus = async ({ id, status }, conn = null) => {
  const db = conn || pool;

  const VALID_STATUS = ['paid', 'unpaid'];

  if (!VALID_STATUS.includes(status))
    throw new Error(`Invalid status: ${status}`);

  try {
    const sql = 'UPDATE purchases SET status = ? WHERE id = ?';

    const [result] = await db.execute(sql, [status, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

module.exports = {
  findById,
  findAll,
  findAllUnpaid,
  findAllWithSupplier,
  findWithItems,
  getNextReceiptSequence,
  sumUnpaidTotal,
  sumPurchaseByCurrentMonth,
  create,
  updateStatus,
};
