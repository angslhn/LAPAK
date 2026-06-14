const ReportService = require('../services/report.service');

const { ok, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getRevenueHandler = async (req, res) => {
  try {
    const { period, from, to } = req.query;

    const data = await ReportService.getRevenue({ period, from, to });

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

const getTopProductsHandler = async (req, res) => {
  try {
    const { limit, period, from, to } = req.query;

    const data = await ReportService.getTopProducts({
      limit,
      period,
      from,
      to,
    });

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

const getByCategoryHandler = async (req, res) => {
  try {
    const data = await ReportService.getByCategory();

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

const getCategoryQuantityHandler = async (req, res) => {
  try {
    const data = await ReportService.getCategoryQuantity();

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

module.exports = {
  getRevenueHandler,
  getTopProductsHandler,
  getByCategoryHandler,
  getCategoryQuantityHandler,
};
