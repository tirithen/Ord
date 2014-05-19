var path = require('path')
  , async = require('async')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , lessMiddleware = require('less-middleware')
  , staticAsset = require('static-asset')
  , serverViewEnableMultipleDirectories = require('./serverViewEnableMultipleDirectories')
  , passport = require('passport')
  , express = require('express')
  , server = express()
  , models = require('./models')
  , services = require('./services')
  , themeName = services.siteSettings.getAll().theme
  , policies
  , controllers
  , directories = [];

server.use(bodyParser());
server.use(cookieParser());
server.use(session({ secret: services.siteSettings.getAll().cookieSecret }));
server.use(passport.initialize());
server.use(passport.session());

// Set less files directories
directories.push(path.join(__dirname, 'themes', themeName));
directories.push(path.join(__dirname));
directories.forEach(function (directory) {
  server.use(lessMiddleware(
      directory
    , {
          debug: process.env.NODE_ENV === 'production' ? true : false
        , compiler: {
            sourceMap: true
          , once: process.env.NODE_ENV === 'production' ? true : false
          , yuicompress: process.env.NODE_ENV === 'production' ? true : false
        }
    }
  ));
  console.log('Registering LESS files source directory ' + directory);
});

// Set static files directories (include less directories)
directories.push(path.join(__dirname, 'themes', themeName, 'style'));
directories.push(path.join(__dirname, 'style'));
directories.push(path.join(__dirname, 'themes', themeName, 'static'));
directories.push(path.join(__dirname, 'static'));
directories.forEach(function (directory) {
  var prefix = '/'
    , directoryBasename = path.basename(directory);

  if (directoryBasename !== 'static') {
    prefix = '/' + directoryBasename;
  }

  server.use(staticAsset(directoryBasename, directory));
  server.use(prefix, express.static(directory));
  console.log('Registering static file directory ' + directory + ' at route ' + prefix);
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
                  req, res, req.isAuthenticated() ? 'pageEditable' : 'page'
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
                , { page: page }
              );
            }
          });
        }
      }
  );
});

// Start listening with the server
server.listen(process.env.PORT || 2000);

console.log('Web server is now listening for connections on http://localhost:' + process.env.PORT || 2000);
