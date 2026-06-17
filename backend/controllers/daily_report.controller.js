const DailyReportService = require('../services/daily_report.service');

const { ok, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getAllHandler = async (req, res) => {
  try {
    const data = await DailyReportService.getAll();

    return ok(res, data);
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const getTodayHandler = async (req, res) => {
  try {
    const data = await DailyReportService.getToday();

    return ok(res, data);
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const getByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await DailyReportService.getById({ id });

    return ok(res, data);
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const closeReportHandler = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    const data = await DailyReportService.closeReport({ user_id });

    return ok(res, data, 'Buku berhasil ditutup');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const getClosureStatusHandler = async (req, res) => {
  try {
    const data = await DailyReportService.getClosureStatus();

    return ok(res, data);
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

const closeAllPendingHandler = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    const results = await DailyReportService.closeAllPending({ user_id });

    return ok(res, results, 'Proses tutup buku selesai');
  } catch (err) {
    let code = err.message;

    if (!ERROR_MESSAGES[code]) {
      code = 'INTERNAL_SERVER_ERROR';
    }

    const message = ERROR_MESSAGES[code];
    const httpStatus = ERROR_STATUS[code];

    return error(res, code, message, httpStatus);
  }
};

module.exports = {
  getAllHandler,
  getTodayHandler,
  getByIdHandler,
  getClosureStatusHandler,
  closeAllPendingHandler,
  closeReportHandler,
};
