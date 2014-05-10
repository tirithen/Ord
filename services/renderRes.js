var services = require('./');

module.exports = function (req, res, viewName, data) {
  data = data || {};
  data.req = data.req || req;

  data.req.protocol = req.connection.encrypted ? 'https' : 'http';
  data.settings = services.settings.data;

  res.render(viewName, data);
};
