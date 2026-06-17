const path = require('path');

const viewAuth = (file) => (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/auth', file));
};

const viewMain = (file) => (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/views/main', file));
};

module.exports = { viewAuth, viewMain };
