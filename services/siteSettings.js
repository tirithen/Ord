var models = require('../models')
  , data = { // Set default values
        siteName: 'Ord'
      , facebookAppSecret: null
      , facebookAppId: null
      , cookieSecret: require('crypto').randomBytes(16).toString('hex')
      , theme: 'default'
      , allowSearchEnginesToIndex: false
    };

module.exports.load = function (callback) {
  models.Setting.find({}, function (err, settings) {
    var key = '', updatedKeys = [];

    if (!err && Array.isArray(settings)) {
      // Update settings from database
      settings.forEach(function (setting) {
        data[setting.key] = setting.value;
        updatedKeys.push(setting.key);
      });

      // Save default values to database for all settings that was not in there
      for(key in data) {
        if (data.hasOwnProperty(key) && updatedKeys.indexOf(key) === -1 ) {
          module.exports.set(key, data[key]);
        }
      }
    }

    callback(err);
  });
};

module.exports.get = function (key) {
  return data[key];
};

module.exports.set = function (key, value) {
  models.Setting.update(
      { key: key }
    , { key: key, value: value }
    , { upsert: true }
    , function (err) {
        if (err) {
          console.error(err);
        } else {
          data[key] = value;
        }
      }
  );
};

module.exports.getAll = function () {
  return JSON.parse(JSON.stringify(data));
};

module.exports.getAllAsObjects = function () {
  var data = module.exports.getAll()
    , key = '';

  for(key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = {
        key: key,
        value: data[key]
      };
    }
  }

  return data;
};
