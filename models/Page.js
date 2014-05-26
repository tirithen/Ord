//ar version = require('mongoose-version');

module.exports = function (mongoose) {
  var model, schema;

  function setAllPagesIsFrontPageFalse(callback) {
    model.update(
        { isFrontPage: true }
      , { $set: { isFrontPage: false } }
      , { multi: true }
      , function (err) {
          if (err) {
            console.error(err);
          }

          if (callback instanceof Function) {
            callback(err);
          }
        }
    );
  }

  function verifyNoParentIfIsFrontPage(value) {
    var valid = true;

    if (this.isFrontPage && this.parent) {
      valid = false;
      // TODO: add user friendly error message
    }

    return valid;
  }

  schema = new mongoose.Schema({
      title: { type: String, required: true, trim: true }
    , content: { type: String, trim: true }
    , parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Page' }
    , showInMenu: { type: Boolean, default: true, required: true }
    , isFrontPage: {
          type: Boolean
        , default: false
        , required: true
        , set: function (value) {
            if (value) {
              setAllPagesIsFrontPageFalse();
            }

            return value;
          }
        , validate: verifyNoParentIfIsFrontPage
      }
    , publishedAt: Date
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
    , updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    , createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  schema.virtual('isPublished').get(function () {
    return this.publishedAt < new Date();
  });

  schema.virtual('isPublic').get(function () {
    // TODO: Handle permissions here
    return this.isPublished;
  });

  schema.virtual('breadcrumbs').get(function () {
    var breadcrumbs = []
      , page = this;

    while (page) {
      breadcrumbs.unshift(page);
      page = page.parent;
    }

    return breadcrumbs;
  });

  schema.virtual('url').get(function () {
    return '/' + this.breadcrumbs.map(function (breadcumbPage) {
      return breadcumbPage.title
    }).join('/');
  });

  // TODO: fix broken mongoose-version
  //schema.plugin(version, { strategy: 'array', collection: 'PageVersions' });

  schema.index({ parent: 1, title: 1 }, { unique: true });

  model = mongoose.model('Page', schema);

  model.listSelectFields = '_id title url updatedAt';
  model.showSelectFields = '_id title content parent showInMenu publishedAt updatedAt createdAt isPublished isPublic url isFrontPage';

  model.listMethod = function (listSelectFields, callback) {
    var fieldsFilter = (listSelectFields ? listSelectFields : model.listSelectFields).trim().split(/\s+/);

    model
      .find()
      .populate('parent')
      .exec(function (err, pages) {
        if (err) {
          callback(err);
        } else {
          model.populate(pages, { path: 'parent.parent' }, function (err, pages) {
            if (fieldsFilter.length > 0) {
              pages = pages.map(function (page) {
                var data = {}, key = '';

                for(key in page) {
                  if (fieldsFilter.indexOf(key) !== -1) {
                    if (key === 'parent' && page[key]) {
                      data[key] = page[key]._id;
                    } else {
                      data[key] = page[key];
                    }
                  }
                }

                return data;
              });
            }

            callback(err, pages);
          });
        }
      });
  };

  return model;
};
