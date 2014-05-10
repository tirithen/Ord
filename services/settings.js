var models = require('../models');

module.exports.data = {};

module.exports.load = function (callback) {
  models.Setting.find({}, function (err, settings) {
    if (!err && Array.isArray(settings)) {
      module.exports.data = {};
      settings.forEach(function (setting) {
        module.exports.data[setting.key] = setting.value;
      });
    }

    callback(err);
  });
};

module.exports.get = function (key) {
  return module.exports.data[key];
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
          module.exports.data[key] = value;
        }
      }
  );
};
