var vows = require('vows')
  , assert = require('assert')
  , Ord = require('../ord')
  , ord = new Ord()
  , systemUserGroupTitles = [ 'anyone', 'administrator', 'editor' ]

vows.describe('services.userGroups').addBatch({
    'when user groups are loaded': {
        topic: function () {
          if (ord.server) {
            return true;
          } else {
            ord.on('listening', this.callback);
          }
        }
      , 'there are 3 user groups called anyone, administrator and editor': function () {
          var userGroups = ord.services.userGroups.getAll();

          userGroups.forEach(function (userGroup) {
            assert.notStrictEqual(systemUserGroupTitles.indexOf(userGroup.systemTitle), -1);
          });
        }
    }
}).export(module);
