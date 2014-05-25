var mongoose = require('mongoose')
  , fs = require('fs')
  , connectionString
  , key = '';

// Figure out the connection string
if (process.env.MONGO_CONNECTION_STRING_ENV_KEY) {
  connectionString = process.env[process.env.MONGO_CONNECTION_STRING_ENV_KEY];
} else if(process.env.MONGO_CONNECTION_STRING) {
  connectionString = process.env.MONGO_CONNECTION_STRING;
} else {
  for(key in process.env) {
    if (
      process.env.hasOwnProperty(key) &&
      process.env[key].match(/^\s*mongodb\:\/\//i)
    ) {
      connectionString = process.env[key];
      break;
    }
  }

  if (!connectionString) {
    connectionString = 'mongodb://localhost/Ord';
  }
}

mongoose.connect(connectionString);

module.exports.mongoose = mongoose;

fs.readdirSync(__dirname).forEach(function (fileName) {
  var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

  if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
    console.log('Loading model ' + moduleName);
    module.exports[moduleName] = require('./' + moduleName)(mongoose);
  }
});
