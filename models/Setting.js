//var version = require('mongoose-version');

module.exports = function (mongoose) {
  var model, schema;

  schema = new mongoose.Schema({
      key: { type: String, required: true, trim: true, unique: true }
    , value: mongoose.Schema.Types.Mixed
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  // TODO: fix broken mongoose-version
  //schema.plugin(version, { strategy: 'array', collection: 'SettingVersions' });

  model = mongoose.model('Setting', schema);

  model.listSelectFields = '_id key value';

  return model;
};
