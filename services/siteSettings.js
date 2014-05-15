var models = require('../models')
  , data = {
        siteName: 'Ord'
      , facebookAppSecret: null
      , facebookAppId: null
      , cookieSecret: require('crypto').randomBytes(16).toString('hex')
      , theme: 'default'
    };

module.exports.load = function (callback) {
  models.Setting.find({}, function (err, settings) {
    if (!err && Array.isArray(settings)) {
      settings.forEach(function (setting) {
        data[setting.key] = setting.value;
      });
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
