var services = require('../services');

module.exports = {
    'GET /robots.txt': function (req, res) {
      res.set('Content-Type', 'text/plain');
      if (services.siteSettings.get('allowSearchEnginesToIndex')) {
        res.send('User-agent: *\nAllow: /');
      } else {
        res.send('User-agent: *\nDisallow: /');
      }
    }
};
