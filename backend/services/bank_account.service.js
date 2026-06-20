const BankAccountModel = require('../models/bank_account.model');

const { getPool } = require('../lib/mysql');
const { cloudinary } = require('../lib/cloudinary');

const { QRIS_NOT_FOUND, NO_IMAGE_PROVIDED } = require('../helpers/error_codes');

const getAll = async (activeOnly = false) => {
  try {
    return await BankAccountModel.findAll(activeOnly);
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (id) => {
  try {
    const account = await BankAccountModel.findById(id);

    if (!account) throw new Error('BANK_ACCOUNT_NOT_FOUND');

    return account;
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  try {
    const { bank_name, account_number, account_owner } = data;

    const accountId = await BankAccountModel.create({
      bank_name,
      account_number,
      account_owner,
      is_active: true,
    });

    return { id: accountId };
  } catch (err) {
    throw new Error(err.message);
  }
};

const update = async (id, data) => {
  try {
    const account = await BankAccountModel.findById(id);

    if (!account) throw new Error('BANK_ACCOUNT_NOT_FOUND');

    const affectedRows = await BankAccountModel.update(id, data);

    if (affectedRows === 0) throw new Error('BANK_ACCOUNT_UPDATE_FAILED');

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const remove = async (id) => {
  try {
    const account = await BankAccountModel.findById(id);

    if (!account) throw new Error('BANK_ACCOUNT_NOT_FOUND');

    const affectedRows = await BankAccountModel.remove(id);

    if (affectedRows === 0) throw new Error('BANK_ACCOUNT_DELETE_FAILED');

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getQRIS = async () => {
  const pool = getPool();

  try {
    const sql = 'SELECT * FROM qris WHERE is_active = TRUE LIMIT 1';

    const [rows] = await pool.execute(sql);

    return rows[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};

const uploadQRIS = async (fileBuffer) => {
  const pool = getPool();

  try {
    if (!fileBuffer) throw new Error(NO_IMAGE_PROVIDED);

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'qris',
              transformation: [{ width: 512, height: 512, crop: 'fill' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(fileBuffer);
      });

      await pool.execute(
        'UPDATE qris SET is_active = FALSE WHERE is_active = TRUE'
      );

      const sql = `
          INSERT INTO qris (image_url, image_public_id, is_active)
          VALUES (?, ?, TRUE)
        `;
      const [insertResult] = await pool.execute(sql, [
        result.secure_url,
        result.public_id,
      ]);

      return {
        id: insertResult.insertId,
        image_url: result.secure_url,
        image_public_id: result.public_id,
      };
    } catch (err) {
      throw new Error(`[QRIS] ${err.message}`);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteQRIS = async () => {
  const pool = getPool();

  try {
    const [qris] = await pool.execute(
      'SELECT id, image_public_id FROM qris WHERE is_active = TRUE LIMIT 1'
    );

    if (qris.length === 0) {
      throw new Error(QRIS_NOT_FOUND);
    }

    if (qris[0].image_public_id) {
      try {
        await cloudinary.uploader.destroy(qris[0].image_public_id);
      } catch (err) {
        console.error('[CLOUDINARY] Delete QRIS failed:', err.message);
      }
    }

    return await pool.execute('DELETE FROM qris WHERE id = ?', [qris[0].id]);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getQRIS,
  uploadQRIS,
  deleteQRIS,
};
