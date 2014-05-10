//ar version = require('mongoose-version');

module.exports = function (mongoose) {
  var model, schema;

  schema = new mongoose.Schema({
      firstName: { type: String, trim: true }
    , lastName: { type: String, trim: true }
    , image: { type: String, trim: true }
    , facebookId: { type: String, trim: true, unique: true }
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  schema.virtual('name').get(function () {
    return this.firstName + ' ' + this.lastName;
  });

  // TODO: fix broken mongoose-version
  //schema.plugin(version, { strategy: 'array', collection: 'PageVersions' });

  model = mongoose.model('User', schema);

  model.listSelectFields = '_id firstName lastName image';

  return model;
};
