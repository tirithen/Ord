var path = require('path')
  , fs = require('fs')
  , async = require('async')
  , session = require('express-session')
  , MongoStore = require('connect-mongo')(session)
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
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
  , port = process.env.PORT || 2000
  , directories = [];

server.set('case sensitive routing', true);
server.use(bodyParser());
server.use(methodOverride());
server.use(cookieParser());
server.use(session({
    name: 'Ord'
  , secret: services.siteSettings.getAll().cookieSecret
  , cookie: {
        maxAge: 2628000000 // Store cookies for one month maximum
    }
  , store: new MongoStore({
        mongoose_connection: models.mongoose.connections[0]
    })
}));
server.use(passport.initialize());
server.use(passport.session());

// Set less files directories
directories = [];
directories.push(path.join(__dirname));
directories.forEach(function (directory) {
  server.use(lessMiddleware(
      directory
    , {
          debug: process.env.NODE_ENV === 'production' ? false : true
        , compiler: {
            sourceMap: true
          , once: process.env.NODE_ENV === 'production' ? true : false
          , yuicompress: process.env.NODE_ENV === 'production' ? true : false
        }
    }
  ));
  console.log('Registering LESS files source directory ' + directory);
});

// Set static files directories (include less and static directories from themes)
directories = [];
fs.readdirSync(path.join(__dirname, 'themes')).forEach(function (themeName) {
  var themeUrl = path.join('themes', themeName)
    , themeDirectory = path.join(__dirname, themeUrl);

  [ 'style', 'static' ].forEach(function (subDirectory) {
    directories.push([
        path.join(themeUrl, subDirectory)
      , path.join(themeDirectory, subDirectory)
    ]);
  });
});
directories.push(path.join(__dirname, 'static'));
directories.forEach(function (directory) {
  var prefix = Array.isArray(directory) ? path.join('/', directory[0]) : '/'
    , directoryBasename = Array.isArray(directory) ? path.basename(directory[1]) : path.basename(directory);

  if (Array.isArray(directory)) {
    directory = directory[1];
  }

  server.use(staticAsset(directory));
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
server.get('*', services.pageRouter);

// Start listening with the server
server.listen(port);

console.log('Web server is now listening for connections on http://localhost:' + port);

module.exports = server;
