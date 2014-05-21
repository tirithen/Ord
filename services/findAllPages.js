var models = require('../models');

module.exports = function (first, second) {
  var callback = first instanceof Function ? first : second
    , listSelectFields = first instanceof Function ? null : first;

  models.Page.listMethod(listSelectFields, callback);
};
