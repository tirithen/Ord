var models = require('./models')
  , services = require('./services')
  , server;

// Load services
services(function (err) {
  if (err) {
    console.error(err);
  } else { // Load the server if all services is up and running without problems
    server = require('./server');
  }
})
