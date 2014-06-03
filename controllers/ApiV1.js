var models = require('../models')
  , services = require('../services')
  , modelName = ''
  , select = ''
  , writeProtectedPropertyNames = [
        'createdAt', 'deltedAt', 'updatedAt', 'createdBy', 'deletedBy', 'updatedBy'
      , '_id', '__v'
    ];

function userHasReadAccess(user, modelInstance) {
  if (
    (
      modelInstance.readibleBy &&
      modelInstance.readibleBy.length > 0 && services.userGroups.userIsMemberOfOneOrMore(user, modelInstance.readibleBy)
    ) ||
    (user && user.isMemberOf('administrator'))
  ) {
    return true;
  } else {
    return false;
  }
}

function userHasWriteAccess(user, modelInstance) {
  if (
    (
      modelInstance.writableBy &&
      modelInstance.writableBy.length > 0 && services.userGroups.userIsMemberOfOneOrMore(user, modelInstance.writableBy)
    ) ||
    (user && user.isMemberOf('administrator'))
  ) {
    return true;
  } else {
    return false;
  }
}

function addListAction(controller, model) {
  controller['GET /api/v1/' + model.modelName] = function (req, res) {
    var listSelectFields = req && req.query.fields ? req.query.fields : model.listSelectFields || '_id updatedAt';

    if (model.listMethod instanceof Function) {
      model.listMethod(listSelectFields, function (err, modelInstances) {
        if (err) {
          res.status(500);
          services.sendJSON(res);
        } else {
          modelInstances = modelInstances.filter(function (modelInstance) {
            return userHasReadAccess(req.user, modelInstance);
          });

          services.sendJSON(res, modelInstances);
        }
      });
    } else {
      model.find({}, listSelectFields, function (err, modelInstances) {
        if (err) {
          res.status(500);
          services.sendJSON(res);
        } else {
          modelInstances = modelInstances.filter(function (modelInstance) {
            return userHasReadAccess(req.user, modelInstance);
          });

          services.sendJSON(res, modelInstances);
        }
      });
    }
  };
}

function addShowAction(controller, model) {
  controller['GET /api/v1/' + model.modelName + '/:id'] = function (req, res) {
    var showSelectFields = req && req.query.fields ? req.query.fields : model.showSelectFields || null
      , data = {}
      , key = ''
      , fieldPopulationList = [];

    if (showSelectFields) {
      showSelectFields = showSelectFields.trim().split(/\s+/);
    }

    showSelectFields.forEach(function (showSelectField) {
      var field = model.schema.paths[showSelectField];

      if (
        field &&
        field.path !== '_id' &&
        (
          ( field.instance && field.instance.toLowerCase() === 'objectid' ) ||
          ( field.caster && field.caster.instance && field.caster.instance.toLowerCase() === 'objectid' )
        )
      ) {
        fieldPopulationList.push(field.path);
      }
    });

    model.findById(req.params.id)
      .populate(fieldPopulationList.join(' '))
      .exec(function (err, modelInstance) {
        if (err) {
          res.status(500);
          services.sendJSON(res);
        } else {
          if (showSelectFields) {
            for(key in modelInstance) {
              if (showSelectFields.indexOf(key) !== -1) {
                data[key] = modelInstance[key];
              }
            }
          } else {
            data = modelInstance;
          }

          // Hide any populated models that user does not have permission to show
          if (fieldPopulationList.length > 0) {
            for(key in modelInstance) {
              if (
                modelInstance.hasOwnProperty(key) &&
                fieldPopulationList.indexOf(key) !== -1 &&
                !userHasReadAccess(req.user, modelInstance[key])
              ) {
                modelInstance[key] = modelInstance[key]._id;
              }
            }
          }

          if (userHasReadAccess(req.user, modelInstance)) {
            services.sendJSON(res, data);
          } else {
            res.status(403);
            services.sendJSON(res, null);
          }
        }
      });
  };
}

function addUpsertAction(controller, model) {
  controller['POST /api/v1/' + model.modelName] = function (req, res) {
    var id = req.body._id, modelInstance, propertyName = '';

    writeProtectedPropertyNames.forEach(function (propertyName) {
      delete req.body[propertyName];
    });

    model.findById(id, function (err, modelInstance) {
      if (err) {
        res.status(500);
        services.sendJSON(res);
      } else if(modelInstance && userHasWriteAccess(req.user, modelInstance)) {
        for(propertyName in req.body) {
          if (req.body.hasOwnProperty(propertyName)) {
            modelInstance[propertyName] = req.body[propertyName];
          }
        }

        modelInstance.updatedBy = req.user;

        modelInstance.save(function (err) {
          if (err) {
            res.status(400);
            services.sendJSON(res, err);
          } else {
            res.status(200);
            services.sendJSON(res, modelInstance);
          }
        });
      } else if(
        !modelInstance &&
        (
          req.user.isMemberOf('administrator') ||
          services.userGroups.userIsMemberOfOneOrMore(req.user, model.createUserGroups)
        )
      ) {
        modelInstance = new model(req.body);

        modelInstance.createdBy = req.user;
        modelInstance.updatedBy = req.user;

        modelInstance.save(function (err) {
          if (err) {
            console.error(err);
            res.status(400);
            services.sendJSON(res, err);
          } else {
            res.status(201);
            services.sendJSON(res, modelInstance);
          }
        });
      } else if (req.isAuthenticated()) {
        res.status(403);
        services.sendJSON(res);
      } else {
        res.status(401);
        services.sendJSON(res);
      }
    });
  };
}

for(modelName in models) {
  if (modelName !== 'mongoose' && models.hasOwnProperty(modelName)) {
    addListAction(module.exports, models[modelName]);
    addShowAction(module.exports, models[modelName]);
    addUpsertAction(module.exports, models[modelName]);
  }
}
