var siteSettings = require('./siteSettings');

// TODO: Make this module fetch the rootPages on a time basis after a request and keep them in memory to limit the number of database lookups

module.exports = function (req, res, viewName, data) {
  data = data || {};
  data.req = data.req || req;

  data.req.protocol = data.req.protocol || req.connection.encrypted ? 'https' : 'http';
  data.siteSettings = data.siteSettings || siteSettings.getAll();

  if (data.rootPages) {
      res.render(viewName, data);
  } else {
    services.findPageChildren(null, function (err, rootPages) {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        data.rootPages = rootPages;
        res.render(viewName, data);
      }
    });
  }
};

module.exports.init = function () {
  services = require('./');
}
