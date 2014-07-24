var services = require('../services');

module.exports = {
  'GET /administration/users': function (req, res) {
    services.renderRes(
      req,
      res,
      'administration/users',
      {
        page: { title: 'Users - Administration' }
      }
    );
  },
  policies: {
    '/^\\/administration/': 'isMemberOfUserGroup("administrator")'
  }
};
