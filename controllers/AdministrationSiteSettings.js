var fs = require('fs')
  , path = require('path')
  , services = require('../services')
  , models = require('../models');

module.exports = {
    'GET /administration/siteSettings': function (req, res) {
      var siteSettings = services.siteSettings.getAllAsObjects();

      siteSettings.theme.options = fs.readdirSync(path.join(__dirname, '../themes'));

      services.renderRes(
          req
        , res
        , 'administration/siteSettings'
        , {
            page: { title: 'Site settings' }
          , siteSettings: siteSettings
        }
      );
    }
  , 'POST /administration/siteSettings': function (req, res) {
      /*req.body.settings.forEach(function (setting) {
        console.log(setting);
      });*/
    }
  , policies: {
      '/^\\/administration/siteSettings/': 'isAuthenticated'
  }
}
