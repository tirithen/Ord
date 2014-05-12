var fs = require('fs');

module.exports = function (server) {
  module.exports = {};

  fs.readdirSync(__dirname).forEach(function (fileName) {
    var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

    if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
      console.log('Loading policy ' + moduleName);
      module.exports[moduleName] = require('./' + moduleName);
    }
  });
};
