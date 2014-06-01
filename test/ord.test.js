var vows = require('vows')
  , assert = require('assert')
  , Ord = require('../ord')
  , ord = new Ord();

vows.describe('ord').addBatch({
    'when the Ord system is started': {
        topic: function () {
          if (ord.server) {
            return false;
          } else if (ord.error) {
            return true;
          } else {
            ord.on('listening', this.callback);
            ord.on('error', this.callback);
          }
        }
      , 'there are no errors': function (err) {
          assert.isFalse(!!err);
        }
    }
}).export(module);
