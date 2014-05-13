var services = require('../services')
  , models = require('../models');

module.exports = {
    'GET /profile': function (req, res) {
      services.findPageChildren(null, function (err, rootPages) {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else {
          req.user.title = req.user.name;
          services.renderRes(req, res, 'profile', {
              page: req.user
            , rootPages: rootPages
          });
        }
      });
    }
  , policies: {
      '/^\\/profile/': 'isAuthenticated'
  }
}
