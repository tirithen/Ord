var models = require('./models')
  , services = require('./services')
  , path = require('path')
  , async = require('async')
  , express = require('express')
    server = express();

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');

server.get('*', function (req, res) {
  async.parallel(
      [
          function (callback) { services.findPageByUrl(req.url, callback) }
        , function (callback) { services.findPageChildren(null, callback) }
      ]
    , function (err, results) {
        var page = results[0]
          , rootPages = results[1];

        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else if (page) {
          services.findPageChildren(page, function (err, pageChildren) {
            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else {
              res.render(
                'page',
                {
                    rootPages: rootPages
                  , page: page
                  , pageChildren: pageChildren
                  , settings: services.settings.data
                }
              );
            }
          });
        } else {
          res.status(404).send('Not found');
        }
      }
  );
});

server.listen(process.env.PORT || 2000);
