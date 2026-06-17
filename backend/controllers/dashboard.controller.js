const DashboardService = require('../services/dashboard.service');
const DailyReportService = require('../services/daily_report.service');

const { ok, error } = require('../helpers/response');

const ERROR_MESSAGES = require('../helpers/error_messages');
const ERROR_STATUS = require('../helpers/error_status');

const getSummaryHandler = async (req, res) => {
  try {
    const dashboardData = await DashboardService.getSummary();

    const closureStatus = await DailyReportService.getClosureStatus();

    return ok(res, { ...dashboardData, daily_closure: closureStatus });
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

module.exports = { getSummaryHandler };
