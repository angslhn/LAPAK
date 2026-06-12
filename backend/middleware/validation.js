const fieldsLabel = require('../helpers/field_labels');

const validation = (fields, validate) => (req, res, next) => {
  const params = req.params;
  const query = req.query;
  const payload = req.body?.data ? JSON.parse(req.body.data) : req.body || {};

  const fieldsMap = {};

  for (const [field, type] of fields) {
    let value;
    let fromPayload = false;

    if (params[field] !== undefined) {
      value = params[field];
    } else if (query[field] !== undefined) {
      value = query[field];
    } else if (payload[field] !== undefined) {
      value = payload[field];
      fromPayload = true;
    }

    if (value === undefined) continue;

    if (fromPayload && typeof value !== type) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: `${fieldsLabel[field] || field} harus berupa ${type}`,
      });
    }

    fieldsMap[field] = value;
  }

  try {
    validate(fieldsMap);

    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: err.message,
    });
  }
};

module.exports = validation;
