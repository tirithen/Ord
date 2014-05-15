var path = require('path')
  , async = require('async')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , staticAsset = require('static-asset')
  , serverViewEnableMultipleDirectories = require('./serverViewEnableMultipleDirectories')
  , passport = require('passport')
  , express = require('express')
  , server = express()
  , models = require('./models')
  , services = require('./services')
  , themeName = services.siteSettings.getAll().theme
  , policies
  , controllers;

server.use(bodyParser());
server.use(cookieParser());
server.use(session({ secret: services.siteSettings.getAll().cookieSecret }));
server.use(passport.initialize());
server.use(passport.session());

// Set static files directories
[
    path.join(__dirname, 'themes', themeName, 'static')
  , path.join(__dirname, 'static')
].forEach(function (staticDirectory) {
  server.use(staticAsset(staticDirectory));
  server.use(express.static(staticDirectory));
});

// Select views directory
serverViewEnableMultipleDirectories(server);
server.set(
    'views'
  , [
        path.join(__dirname, 'themes', themeName, 'views')
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
      ]
    , function (err, results) {
        var page = results[0];

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
                  //~ req, res, 'page'
                  req, res, 'pageEditable'
                , {
                      page: page
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
