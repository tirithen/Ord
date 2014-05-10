var fs = require('fs');

function registerController(moduleName, server) {
  var controller = require('./' + moduleName)
    , matches
    , actionName = ''
    , actionMethod = ''
    , actionRoute = '';

  for(actionName in controller) {
    if (controller.hasOwnProperty(actionName)) {
      matches = actionName.match(/^\s*([a-z]+)\s+(.+?)\s*$/i);

      if (matches) {
        actionMethod = matches[1];
        actionRoute = matches[2];
      }

      console.log('Regestering route ' + actionName);
      server[actionMethod.toLowerCase()](actionRoute, controller[actionName]);
    }
  }
}

module.exports = function (server) {
  fs.readdirSync(__dirname).forEach(function (fileName) {
    var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

    if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
      console.log('Loading controller ' + moduleName);
      registerController(moduleName, server);
    }
  });
};
