var mongoose = require('mongoose')
  , fs = require('fs');

mongoose.connect(process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/Ord');

module.exports.mongoose = mongoose;

fs.readdirSync(__dirname).forEach(function (fileName) {
  var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

  if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
    console.log('Loading model ' + moduleName);
    module.exports[moduleName] = require('./' + moduleName)(mongoose);
  }
});
