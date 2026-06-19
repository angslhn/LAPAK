const { getPool } = require('../lib/mysql');
const { getLocalDate } = require('../helpers/datetime');

const sanitize = require('../helpers/sanitize');

const ALLOWED_FIELDS = [
  'date',
  'total_revenue',
  'total_expense',
  'transaction_count',
  'net_profit',
  'opening_balance',
  'closing_balance',
  'status',
  'closed_by',
  'closed_at',
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

const findOpenReports = async () => {
  try {
    const sql = `
      SELECT * FROM daily_reports 
      WHERE status = 'open' 
      ORDER BY date ASC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findOpenReportsBeforeDate = async (date) => {
  try {
    const sql = `
      SELECT * FROM daily_reports 
      WHERE date < ? AND status = 'open' 
      ORDER BY date ASC
    `;
    const [rows] = await pool.execute(sql, [date]);
    return rows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const findMissingDates = async () => {
  try {
    const [firstCash] = await pool.execute(
      'SELECT MIN(date) AS first_date FROM cash_ledger'
    );

    if (!firstCash[0]?.first_date) return [];

    const firstDate = firstCash[0].first_date;
    const endDate = getLocalDate();

    const start = new Date(firstDate);
    const end = new Date(endDate);

    const [existingReports] = await pool.execute(
      'SELECT date FROM daily_reports'
    );

    const existingSet = new Set(existingReports.map((r) => r.date));

    const missingDates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      if (!existingSet.has(dateStr)) {
        missingDates.push(dateStr);
      }
    }

    return missingDates;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const getPendingClosures = async () => {
  const openReports = await findOpenReports();
  const missingDates = await findMissingDates();

  return {
    openReports,
    missingDates,
  };
};

const create = async (data) => {
  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);

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

const update = async (id, data) => {
  const cleanData = sanitize(data);

  const fields = Object.keys(cleanData).filter((field) =>
    ALLOWED_FIELDS.includes(field)
  );

  if (fields.length === 0) throw new Error('No valid fields provided');

  const values = fields.map((field) => cleanData[field]);
  const placeholders = fields.map((field) => `${field} = ?`).join(', ');

  try {
    const sql = `UPDATE daily_reports SET ${placeholders} WHERE id = ?`;

    const [result] = await pool.execute(sql, [...values, id]);

    return result.affectedRows;
  } catch (err) {
    throw new Error(`[DATABASE] ${err.message}`);
  }
};

const closeReport = async (id, userId) => {
  try {
    const sql = `
      UPDATE daily_reports 
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
  findOpenReports,
  findOpenReportsBeforeDate,
  findMissingDates,
  getPendingClosures,
  create,
  update,
  closeReport,
};
