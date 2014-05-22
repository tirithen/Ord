// TODO: rename all variables called page(s) to entity/entities

var models = require('../models')
  , services = require('../services')
  , modelName = ''
  , select = ''
  , writeProtectedPropertyNames = [
        'createdAt', 'deltedAt', 'updatedAt', 'createdBy', 'deletedBy', 'updatedBy'
      , '_id', '__v'
    ];

function addListAction(controller, model) {
  controller['GET /api/v1/' + model.modelName] = function (req, res) {
    var listSelectFields = req && req.query.fields ? req.query.fields : model.listSelectFields || '_id updatedAt';

    if (model.listMethod instanceof Function) {
      model.listMethod(listSelectFields, function (err, pages) {
        if (err) {
          res.status(500);
          services.sendJSON(res);
        } else {
          services.sendJSON(res, pages);
        }
      });
    } else {
      model.find({}, listSelectFields, function (err, pages) {
        if (err) {
          res.status(500);
          services.sendJSON(res);
        } else {
          services.sendJSON(res, pages);
        }
      });
    }
  };
}

function addShowAction(controller, model) {
  controller['GET /api/v1/' + model.modelName + '/:id'] = function (req, res) {
    var showSelectFields = req && req.query.fields ? req.query.fields : model.showSelectFields || null
      , data = {}
      , key = '';

    if (showSelectFields) {
      showSelectFields = showSelectFields.trim().split(/\s+/);
    }

    model.findById(req.params.id, function (err, page) {
      if (err) {
        res.status(500);
        services.sendJSON(res);
      } else {
        if (showSelectFields) {
          for(key in page) {
            if (showSelectFields.indexOf(key) !== -1) {
              data[key] = page[key];
            }
          }
        } else {
          data = page;
        }

        services.sendJSON(res, data);
      }
    });
  };
}

function addUpsertAction(controller, model) {
  controller['POST /api/v1/' + model.modelName] = function (req, res) {
    var id = req.body._id, page, propertyName = '';

    writeProtectedPropertyNames.forEach(function (propertyName) {
      delete req.body[propertyName];
    });

    if (id) {
      model.findById(id, function (err, page) {
        var propertyName = '';

        for(propertyName in req.body) {
          if (req.body.hasOwnProperty(propertyName)) {
            page[propertyName] = req.body[propertyName];
          }
        }

        page.save(function (err) {
          if (err) {
            console.error(err);
            res.status(400);
            services.sendJSON(res, err);
          } else {
            res.status(200);
            services.sendJSON(res, page);
          }
        });
      });
    } else {
      page = new models.Page(req.body);
      page.save(function (err) {
        if (err) {
          console.error(err);
          res.status(400);
          services.sendJSON(res, err);
        } else {
          res.status(201);
          services.sendJSON(res, page);
        }
      });
    }
  };
}

for(modelName in models) {
  if (modelName !== 'mongoose' && models.hasOwnProperty(modelName)) {
    addListAction(module.exports, models[modelName]);
    addShowAction(module.exports, models[modelName]);
    addUpsertAction(module.exports, models[modelName]);
  }
}

module.exports.policies = {
    '/^\\/api\\/v1/': 'isAuthenticated'
};
