// TODO: add general error handling for $resource calls
// TODO: use local cache for the resources
// TODO: use updatedAt parameter to only get the new changes since last sync

function ResourceService($resource, $timeout) {
  this.$resource = $resource;
  this.$timeout = $timeout;
}

ResourceService.prototype.bindToResource = function (options) {
  if (!this[options.name]) {
    this[options.name] = ResourceService._Resource(options, this.$resource, this.$timeout);
  }

  return this[options.name];
 };

ResourceService._Resource = function (options, $resource, $timeout) {
  options = options || {};

  var $resource = $resource(options.url, { id: '@id' });

  // TODO: implement allowedMethods from backend rules
  // TODO: implement validation from backend rules
  // TODO: implement subscribe to updates

  var resource = [];

  options.syncWithServerInterval = options.syncWithServerInterval || 20000;

  resource.options = options;
  resource.$resource = $resource;
  resource.$timeout = $timeout;

  resource.updateObject = function (oldResouceObject, newResouceObject) {
    somethingWasUpdated = false;

    // Add new properties and update existing properties
    Object.keys(newResouceObject).forEach(function (key) {
      if (oldResouceObject[key] !== newResouceObject[key]) {
        oldResouceObject[key] = newResouceObject[key];
        somethingWasUpdated = true;
      }
    });

    // Delete properties that is missing in the new version
    Object.keys(oldResouceObject).forEach(function (key) {
      if (!newResouceObject.hasOwnProperty(key)) {
        delete oldResouceObject[key];
        somethingWasUpdated = true;
      }
    });

    return somethingWasUpdated;
  };

  resource.syncWithServer = function (callback) {
    var somethingWasUpdated = false;

    this.$resource.query(function (response) {
      // Add new resource objects and update existing resource objects
      response.forEach(function (newResouceObject) {
        var foundOld = false;

        resource.forEach(function (oldResouceObject) {
          if (newResouceObject._id === oldResouceObject._id) {
            foundOld = true;
            if (resource.updateObject(oldResouceObject, newResouceObject)) {
              somethingWasUpdated = true;
            }
          }
        });

        if (!foundOld) {
          resource.push(newResouceObject);
          somethingWasUpdated = true;
        }
      });

      // Remove any resource objects that is no longer avaliable
      resource.forEach(function (oldResouceObject, oldIndex) {
        var found = false;

        response.forEach(function (newResouceObject) {
          if (newResouceObject._id === oldResouceObject._id) {
            found = true;
          }
        });

        if (!found) {
          oldResouceObject.splice(oldIndex, 1);
          somethingWasUpdated = true;
        }
      });

      // Trigger redraw if something was updated
      if (somethingWasUpdated) {
        resource.$timeout(function() {
          if (callback instanceof Function) {
            callback();
          }
        });
      } else {
        if (callback instanceof Function) {
          callback();
        }
      }
    });
  };

  function syncWithServerLoop() {
    resource.syncWithServer(function () {
      setTimeout(syncWithServerLoop, resource.options.syncWithServerInterval);
    });
  };
  syncWithServerLoop();

  return resource;
};

app.service('ResourceService', ResourceService);
