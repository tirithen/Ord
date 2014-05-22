var services = require('../services')
  , models = require('../models');

module.exports = {
    'GET /administration/page': function (req, res) {
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
      '/^\\/administration/page/': 'isAuthenticated'
  }
}
