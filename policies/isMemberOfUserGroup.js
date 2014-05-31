var models = require('../models')
  , services = require('../services');

module.exports = function () {
  var userGroups = Array.prototype.slice.call(arguments, 0).map(function (userGroup) {
    userGroup = userGroup instanceof models.UserGroup ? userGroup : services.userGroups.getBySystemTitle(userGroup);
    if (!userGroup) {
      throw new Error('The user group with the system title ' + userGroup + ' could not be found, verify that it exists.');
    }

    return userGroup;
  });

  return function (req, res, next) {
    var memberOfAllRequiredGroups = true;

    userGroups.forEach(function (userGroup) {
      if (
        memberOfAllRequiredGroups &&
        (
          userGroup.systemTitle === 'anyone' ||
          (
            req.isAuthenticated() && !req.user.isMemberOf(userGroup)
          )
        )
      ) {
        memberOfAllRequiredGroups = false;
      }
    });

    if (memberOfAllRequiredGroups) {
      next();
    } else if (req.isAuthenticated()) {
      res.status(403);
      services.renderRes(req, res, '403');
    } else {
      res.status(401);
      services.renderRes(req, res, '401');
    }
  };
};
