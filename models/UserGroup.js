module.exports = function (mongoose) {
  var model
    , schema
    , ObjectId = mongoose.Schema.Types.ObjectId;

  schema = new mongoose.Schema({
      title: { type: String, required: true, trim: true, unique: true }
    , systemTitle: { type: String, trim: true, unique: true, sparse: true, get: function (value) { return value ? value : this.title; } }
    , members: [ {type: ObjectId, ref: 'User' } ]
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
    , updatedBy: { type: ObjectId, ref: 'User' }
    , createdBy: { type: ObjectId, ref: 'User' }
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  model = mongoose.model('UserGroup', schema);

  model.listSelectFields = '_id title systemTitle updatedAt';

  return model;
};
