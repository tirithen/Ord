var EventEmitter = require('events').EventEmitter
  , util = require("util");

function Ord() {
  var self = this;

  EventEmitter.call(self);

  console.log('Starting the Ord system...');

  self.models = require('./models');
  self.services = require('./services');

  // Load services
  self.services(function (err) {
    if (err) {
      console.error(err);
      self.emit('error', err);
    } else { // Load the server if all services is up and running without problems
      self.server = require('./server');
      self.emit('listening');
    }
  });
}

util.inherits(Ord, EventEmitter);

module.exports = Ord;
