//var version = require('mongoose-version');

module.exports = function (mongoose) {
  var model, schema;

  schema = new mongoose.Schema({
    key: { type: String, required: true, trim: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  });

  // TODO: fix broken mongoose-version
  //schema.plugin(version, { strategy: 'array', collection: 'SettingVersions' });

  model = mongoose.model('Setting', schema);

  return model;
};
