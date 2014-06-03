var models = require('../models')
  , async = require('async')
  , userGroups = []
  , userGroupUpdateInterval = 10000
  , systemUserGroups = [ 'anyone', 'administrator', 'editor' ];

module.exports.createSystemUserGroupsIfMissing = function (callback) {
  async.each(
      systemUserGroups
    , function (systemUserGroupTitle, next) {
        models.UserGroup.findOne({ systemTitle: systemUserGroupTitle }, function (err, userGroup) {
          if (err) {
            next(err);
          } else if (!userGroup) {
            userGroup = new models.UserGroup({ title: systemUserGroupTitle, systemTitle: systemUserGroupTitle });
            userGroup.save(next);
          } else {
            next();
          }
        });
      }
    , function (err) {
        if (err) {
          console.error(err);
        }

        if (callback instanceof Function) {
          callback(err);
        }
      }
  );
};

module.exports.updateAllUserGroupsFromDatabase = function (callback) {
  models.UserGroup.find({}, function (err, userGroupDocuments) {
    if (err) {
      console.error(err);
    }

    userGroups = userGroupDocuments || [];

    setTimeout(module.exports.update, userGroupUpdateInterval);

    if (callback instanceof Function) {
      callback(err);
    }
  });
};

module.exports.getBySystemTitle = function (title) {
  return userGroups.filter(function (userGroup) {
    if (userGroup.systemTitle === title) {
      return true;
    } else {
      return false;
    }
  })[0];
};

module.exports.getByTitle = function (title) {
  return userGroups.filter(function (userGroup) {
    if (userGroup.title === title) {
      return true;
    } else {
      return false;
    }
  })[0];
};

module.exports.getForUser = function (user) {
  return userGroups.filter(function (userGroup) {
    var userGroupMemberIds = userGroup.members.map(function (member) {
          if (member._id) {
            return member._id.toString();
          } else if (member) {
            return member.toString();
          }
        });

    if (userGroup.systemTitle !== 'anyone' && (!user || userGroupMemberIds.indexOf(user._id.toString()) === -1)) {
      return false;
    } else {
      return true;
    }
  });
};

module.exports.getAll = function () {
  return userGroups;
};

module.exports.userIsMemberOf = function (user, userGroupSearch) {
  var userGroupsForUser = module.exports.getForUser(user)
    , userGroupSearchSystemTitle = userGroupSearch instanceof models.UserGroup ? userGroupSearch.systemTitle : userGroupSearch;

  return userGroupsForUser.filter(function (userGroup) {
    if (userGroup.systemTitle === userGroupSearchSystemTitle) {
      return true;
    } else {
      return false;
    }
  }).length > 0;
};

module.exports.userIsMemberOfOneOrMore = function (user, userGroupSearch) {
  var result = false;

  if (!Array.isArray(userGroupSearch)) {
    userGroupSearch = [ userGroupSearch ];
  }

  userGroupSearch.forEach(function (userGroup) {
    if (module.exports.userIsMemberOf(user, userGroup)) {
      result = true;
    }
  });

  return result;
};

module.exports.init = function (callback) {
  async.parallel(
      [
          module.exports.createSystemUserGroupsIfMissing
        , module.exports.updateAllUserGroupsFromDatabase
      ]
    , callback
  );
};
