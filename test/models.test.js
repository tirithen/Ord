var vows = require('vows')
  , assert = require('assert')
  , Ord = require('../ord')
  , ord = new Ord();

vows.describe('models').addBatch({
    'when models are loaded': {
        topic: function () {
          return true;
        }
      , 'Page model should be loaded': function () {
          assert.isFunction(ord.models.Page);
        }
      , 'Setting model should be loaded': function () {
          assert.isFunction(ord.models.Setting);
        }
      , 'User model should be loaded': function () {
          assert.isFunction(ord.models.User);
        }
      , 'UserGroup model should be loaded': function () {
          assert.isFunction(ord.models.UserGroup);
        }
      , 'Page model is queriable without errors': function () {
          assert.isFunction(ord.models.Page);
        }
      , 'Setting model should be loaded': function () {
          assert.isFunction(ord.models.Setting);
        }
      , 'User model should be loaded': function () {
          assert.isFunction(ord.models.User);
        }
      , 'UserGroup model should be loaded': function () {
          assert.isFunction(ord.models.UserGroup);
        }
    }
  , 'when model Page is queried': {
        topic: function () {
          ord.models.Page.findOne({}, this.callback);
        }
      , 'there are no error': function (err) {
          assert.isTrue(true);
        }
    }
  , 'when model Setting is queried': {
        topic: function () {
          ord.models.Setting.findOne({}, this.callback);
        }
      , 'there are no error': function (err) {
          assert.isTrue(true);
        }
    }
  , 'when model User is queried': {
        topic: function () {
          ord.models.User.findOne({}, this.callback);
        }
      , 'there are no error': function (err) {
          assert.isTrue(true);
        }
    }
  , 'when model UserGroup is queried': {
        topic: function () {
          ord.models.UserGroup.findOne({}, this.callback);
        }
      , 'there are no error': function (err) {
          assert.isTrue(true);
        }
    }
}).export(module);
