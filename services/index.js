var fs = require('fs')
  , async = require('async');

module.exports = function (callback) {
  var services = {};

  async.each(
      fs.readdirSync(__dirname)
    , function (fileName, next) {
        var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

        if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
          console.log('Loading service ' + moduleName);
          services[moduleName] = require('./' + moduleName);
          if (services[moduleName].load instanceof Function) {
            services[moduleName].load(next);
          } else {
            next();
          }
        } else {
          next();
        }
      }
    , function (err) {
      var moduleName = '';

      module.exports = services;

      for(moduleName in services) {
        if (
          services.hasOwnProperty(moduleName) &&
          services[moduleName].init instanceof Function
        ) {
console.log(moduleName);
          services[moduleName].init();
        }
      }

      callback(err);
    }
  )
};
