var services = require('../services')
  , models = require('../models');

module.exports = {
    'GET /administration/page/create': function (req, res) {
      services.findPageChildren(null, function (err, rootPages) {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else {
          services.renderRes(req, res, 'page', { page: new models.Page(), rootPages: rootPages });
        }
      });
    }
  , 'GET /administration/page': function (req, res) {
      services.findAllPages(function (err, pages) {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else {
          services.renderRes(req, res, 'administration/pageList', { pages: pages });
        }
      });
    }
  , policies: {
      '/^\\/administration/': 'isAuthenticated'
  }
}
