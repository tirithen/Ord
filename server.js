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
  , policies
  , controllers;

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

// Register the policies
policies = require('./policies')(server);

// Register the controllers
controllers = require('./controllers')(server);

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
          services.findPageByUrl('/404', function (err, page) {
            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else {
              res.status(404);
              services.renderRes(
                  req, res, '404'
                , {
                      rootPages: rootPages
                    , page: page
                  }
              );
            }
          });
        }
      }
  );
});

// Start listening with the server
server.listen(process.env.PORT || 2000);
