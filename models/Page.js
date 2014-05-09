//ar version = require('mongoose-version');

module.exports = function (mongoose) {
  var model, schema;

  schema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    parent: mongoose.Schema.Types.ObjectId,
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now }
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
    return this.breadcrumbs.map(function (breadcumbPage) {
      return breadcumbPage.title
    }).join('/');
  });

  // TODO: fix broken mongoose-version
  //schema.plugin(version, { strategy: 'array', collection: 'PageVersions' });

  schema.index({ parent: 1, title: 1 }, { unique: true });

  model = mongoose.model('Page', schema);

  return model;
};
