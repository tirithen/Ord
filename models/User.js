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

  schema = new mongoose.Schema({
      firstName: { type: String, trim: true }
    , lastName: { type: String, trim: true }
    , email: { type: String, trim: true }
    , image: { type: String, trim: true }
    , facebookId: { type: String, trim: true, unique: true }
    , updatedAt: { type: Date, default: Date.now }
    , createdAt: { type: Date, default: Date.now }
    , updatedBy: { type: ObjectId, ref: 'User' }
    , createdBy: { type: ObjectId, ref: 'User' }
  });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  schema.virtual('name').get(function () {
    return this.firstName + ' ' + this.lastName;
  });

  schema.methods.isMemberOf = function (userGroup) {
    return getServices().userGroups.userIsMemberOf(this, userGroup);
  };

  model = mongoose.model('User', schema);

  model.listSelectFields = '_id firstName lastName image';

  return model;
};
