var services;

module.exports = function (mongoose) {
  var model
    , schema
    , ObjectId = mongoose.Schema.Types.ObjectId;

  function getServices() {
    if (!services) {
      services = require('../services');
    }

    return services;
  }

  function setAllOtherPagesIsFrontPageFalse(page, callback) {
    model.update(
        { isFrontPage: { $ne: false }, _id: { $ne: page._id } }
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
    , parent: {type: ObjectId, ref: 'Page' }
    , showInMenu: { type: Boolean, default: true, required: true }
    , isFrontPage: {
          type: Boolean
        , default: false
        , required: true
        , set: function (value) {
            if (value) {
              setAllOtherPagesIsFrontPageFalse(this);
            }

            return value;
          }
        , validate: verifyNoParentIfIsFrontPage
      }
    , publishedAt: Date
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
    , updatedBy: { type: ObjectId, ref: 'User' }
    , createdBy: { type: ObjectId, ref: 'User' }
    , readibleBy: [ { type: ObjectId, ref: 'UserGroup' } ]
    , writableBy: [ { type: ObjectId, ref: 'UserGroup' } ]
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
    if (this.isFrontPage) {
      return '/';
    } else {
      return '/' + this.breadcrumbs.map(function (breadcumbPage) {
        return breadcumbPage.title
      }).join('/');
    }
  });

  schema.methods.isReadibleBy = function (user) {
    var result = false;

    if (!user) {
      result = this.readibleBy.filter(function (userGroup) {
        return userGroup.systemTitle === 'anyone';
      }).length > 0;
    } else if (user.isMemberOf('administrator')) {
      result = true;
    } else {
      result = this.readibleBy.filter(function (userGroup) {
        return getServices().userGroups.userIsMemberOf(user, userGroup);
      }).length > 0;
    }

    return result;
  };

  schema.methods.isWritableBy = function (user) {
    var result = false;

    if (user) { // Only allow write with user
      result = this.writableBy.filter(function (userGroup) {
        return getServices().userGroups.userIsMemberOf(user, userGroup);
      }).length > 0;
    }

    return result;
  };

  schema.index({ parent: 1, title: 1 }, { unique: true });

  model = mongoose.model('Page', schema);

  model.listSelectFields = '_id title url updatedAt';
  model.showSelectFields = '_id title content parent readibleBy writableBy showInMenu publishedAt updatedAt createdAt updatedBy createdBy isPublished isPublic url isFrontPage';

  model.createUserGroups = [ 'editor' ];

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
