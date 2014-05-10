var path = require('path')
  , async = require('async')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , serverViewEnableMultipleDirectories = require('./serverViewEnableMultipleDirectories')
  , passport = require('passport')
  , express = require('express')
  , server = express()
  , models = require('./models')
  , services = require('./services')
  , controller;

server.use(bodyParser());
server.use(cookieParser());
server.use(session({ secret: services.settings.data.cookieSecret }));
server.use(passport.initialize());
server.use(passport.session());

// Select views directory
serverViewEnableMultipleDirectories(server);
server.set(
    'views'
  , [
        path.join(__dirname, 'themes', services.settings.data.theme || 'default')
      , path.join(__dirname, 'views')
    ]
);
server.set('view engine', 'jade');

// Register the controllers
controller = require('./controllers')(server);

// Register the page router
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
        } else if (page && page.isPublished) {
          services.findPageChildren(page, function (err, pageChildren) {
            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else {
              services.renderRes(
                  req, res, 'page'
                , {
                      rootPages: rootPages
                    , page: page
                    , pageChildren: pageChildren
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

// Start listening with the server
server.listen(process.env.PORT || 2000);
