var services = require('../services');
var models = require('../models');

module.exports = {
  'GET /profile': function (req, res) {
    req.user.title = req.user.name;
    services.renderRes(req, res, 'profile', { page: req.user });
  },
  policies: {
    '/^\\/profile/': 'isMemberOfUserGroup("accepted")'
  }
}
