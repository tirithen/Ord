var models, services, server;

console.log('Starting the Ord system...');

models = require('./models');
services = require('./services');

// Load services
services(function (err) {
  if (err) {
    console.error(err);
  } else { // Load the server if all services is up and running without problems
    server = require('./server');
  }
})
