var models = require('../models');

module.exports.data = {};

module.exports.update = function () {
  models.Setting.find({}, function (err, settings) {
    if (err) {
      console.error(err);
    } else {
      module.exports.data = {};
      settings.forEach(function (setting) {
        module.exports.data[setting.key] = setting.value;
      });
    }
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

module.exports.update();
