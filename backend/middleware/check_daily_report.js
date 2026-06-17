const DailyReportModel = require('../models/daily_report.model');

const { getLocalDate } = require('../helpers/datetime');
const { error } = require('../helpers/response');

const checkDailyReport = async (req, res, next) => {
  try {
    const today = getLocalDate();

    const report = await DailyReportModel.findByDate(today);

    if (report && report.status === 'closed') {
      return error(
        res,
        'DAILY_REPORT_CLOSED',
        'Buku hari ini sudah ditutup. Tidak dapat melakukan transaksi keuangan.',
        400
      );
    }

    next();
  } catch (err) {
    return error(
      res,
      'INTERNAL_SERVER_ERROR',
      'Terjadi kesalahan pada server',
      500
    );
  }
};

module.exports = checkDailyReport;
