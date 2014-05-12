var services = require('../services');

module.exports = {
    'GET /sitemap.xml': function (req, res) {
      services.findAllPages(function (err, pages) {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else {
          res.setHeader('Content-Type', 'text/xml');
          services.renderRes(req, res, 'sitemapXml', { pages: pages });
        }
      });
    }
}
