var models = require('../models');

module.exports = function (callback) {
  models.Page
    .find()
    .populate('parent')
    .exec(function (err, pages) {
      if (err) {
        callback(err);
      } else {
        models.Page.populate(pages, { path: 'parent.parent' }, callback);
      }
    });
};
