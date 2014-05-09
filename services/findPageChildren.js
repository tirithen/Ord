var models = require('../models');

module.exports = function (page, callback) {
  models.Page
    .find({ parent: page ? page._id : null })
    .populate('parent')
    .exec(function (err, pages) {
      if (err) {
        callback(err);
      } else {
        models.Page.populate(pages, { path: 'parent.parent' }, callback);
      }
    });
};
