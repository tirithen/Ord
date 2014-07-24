var services = require('../services');
var models = require('../models');

module.exports = {
  'GET /administration/pages': function (req, res) {
    services.findAllPages(function (err, pages) {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        services.renderRes(req, res, 'administration/pages', { pages: pages });
      }
    });
  },
  policies: {
    '/^\\/administration/pages/': 'isMemberOfUserGroup("administrator")'
  }
}
