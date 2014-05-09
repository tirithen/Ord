var fs = require('fs');

fs.readdirSync(__dirname).forEach(function (fileName) {
  var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

  if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
    console.log('Loading service ' + moduleName);
    module.exports[moduleName] = require('./' + moduleName);
  }
});
