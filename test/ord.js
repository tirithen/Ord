var vows = require('vows')
  , assert = require('assert')
  , parseXmlString = require('xml2js').parseString
  , Ord = require('../ord')
  , ord = new Ord()
  , request = require('request')
  , port = process.env.PORT || 2000;

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
}).addBatch({
    'when the GET /sitemap.xml is requested': {
        topic: function () {
          request.get('http://localhost:' + port + '/sitemap.xml', this.callback);
        }
      , 'HTTP status 200 is returned': function (res) {
          assert.strictEqual(res.statusCode, 200);
        }
      , 'basic XML structure is valid': function (res) {
          parseXmlString(res.body, function (err, data) {
            assert.isNull(err);
            assert.isObject(data.urlset);
          });
        }
    }
}).export(module);
