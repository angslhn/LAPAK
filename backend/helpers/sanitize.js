const sanitizeForDB = (data) => {
  const cleanData = {};

  for (const [key, value] of Object.entries(data)) {
    cleanData[key] = value === undefined ? null : value;
  }

  return cleanData;
};

module.exports = sanitizeForDB;
