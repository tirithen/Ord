var services = require('../services');

module.exports = {
  'GET /administration': function (req, res) {
    services.renderRes(
      req,
      res,
      'administration/index',
      {
        page: { title: 'Administration' }
      }
    );
  },
  policies: {
    '/^\\/administration/': 'isMemberOfUserGroup("administrator")'
  }
};
