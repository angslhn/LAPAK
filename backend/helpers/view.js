const path = require('path');

const view = (file) => (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views', file));
};

module.exports = { view };
