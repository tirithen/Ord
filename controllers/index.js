var fs = require('fs')
  , async = require('async')
  , policies = require('../policies')
  , allowedMethods = [
        'OPTIONS'
      , 'GET'
      , 'HEAD'
      , 'POST'
      , 'PUT'
      , 'DELETE'
      , 'TRACE'
      , 'CONNECT'
    ]
  , allowedMethodsPattern = new RegExp('^(' + allowedMethods.join('|') + ')(\\s+|,)', 'i')
  , methodsExtractPattern = new RegExp('^\s*([' + allowedMethods.join('') + ',]+)(\\s+)', 'i')
  , policyArgumentsExtractPattern = /^(.+?)\((.*?)\)\s*$/
  , middlewarePolicies = [];

function registerController(moduleName, server) {
  var controller = require('./' + moduleName)
    , matches
    , methods = []
    , policyNames = []
    , policyPattern = []
    , policyPatternName = ''
    , actionName = ''
    , actionMethod = ''
    , actionRoute = '';

  // Register policies
  if (controller.policies) {
    for(policyPatternName in controller.policies) {
      if (controller.policies.hasOwnProperty(policyPatternName)) {
        console.log('Regestering policy ' + controller.policies[policyPatternName] +
                    ' for routes matching "' + policyPatternName + '".');

        policyNames = controller.policies[policyPatternName];
        if (!Array.isArray(policyNames)) {
          policyNames = [ policyNames ];
        }

        if (policyPatternName.match(allowedMethodsPattern)) {
          methods = policyPatternName.match(methodsExtractPattern)[1];
          methods = methods.split(/\s*,\s*/);
        }

        if (methods.length === 0) {
          methods = allowedMethods;
        }

        policyNames = policyNames.map(function (policyName) {
          matches = policyName.match(policyArgumentsExtractPattern);
          if (matches) {
            policyName = {
                name: matches[1]
              , arguments: matches[2].split(/["']*\s*,\s*["']*/)
            };
          }

          return policyName;
        });

        try {
          policyPattern = policyPatternName.match(/^(\/.+\/)([ig]*)$/);
          policyPattern = new RegExp(
              policyPattern[1].replace(/^\//, '').replace(/\/$/, '')
            , policyPattern[2]
          );
        } catch (err) {
          throw new Error('The policy pattern "' + policyPatternName + '" is not a ' +
                          'valid RegExp, please node that patterns like \\s needs to ' +
                          'be escaped one extra time (\\\\s) as it is supplied as a  ' +
                          'string', err);
        }

        policyNames.forEach(function (policyName) {
          var policyArguments = policyName.arguments;
          policyName = policyName.name || policyName;
          if (policies[policyName]) {
            middlewarePolicies.push({
                urlPattern: policyPattern
              , methods: methods
              , policyName: policyName
              , policyArguments: policyArguments
            });
          } else {
            throw new Error('The requested policy "' + policyName + '" is not ' +
                            'registered, please ensure that the policy exists.');
          }
        });
      }
    }
  }

  // Register actions
  for(actionName in controller) {
    if (controller.hasOwnProperty(actionName)) {
      if (actionName.match(allowedMethodsPattern)) {
        matches = actionName.match(/^\s*([a-z]+)\s+(.+?)\s*$/i);

        if (matches) {
          actionMethod = matches[1];
          actionRoute = matches[2];
        }

        console.log('Regestering route ' + actionName);
        server[actionMethod.toLowerCase()](actionRoute, controller[actionName]);
      } else if (actionName !== 'policies') {
        throw new Error('The action name "' + actionName + '" is not the policies ' +
                        'attribute nor starts with one of the supported HTTP methods ' +
                        '(' + allowedMethods.join(', ') + ').');
      }
    }
  }
}

module.exports = function (server) {
  // Register policies middleware
  server.use(function (req, res, next) {
    var policyMiddlewares = [];

    // Build a list of middlewares to execute from url and method matching
    middlewarePolicies.forEach(function (policyConfiguration) {
      if (
        req.url.match(policyConfiguration.urlPattern) &&
        policyConfiguration.methods.indexOf(req.method.toUpperCase()) !== -1
      ) {
        if (policyConfiguration.policyArguments) {
          policyMiddlewares.push(policies[policyConfiguration.policyName].apply(this, policyConfiguration.policyArguments));
        } else {
          policyMiddlewares.push(policies[policyConfiguration.policyName]);
        }
      }
    });

    // Run all policy middlewares
    async.each(
        policyMiddlewares
      , function (policy, done) {
          policy(req, res, done);
        }
      , next
    );
  });

  // Find all controllers
  fs.readdirSync(__dirname).forEach(function (fileName) {
    var moduleName = fileName ? fileName.replace(/\.js$/, '') : null;

    if (fileName && fileName !== 'index.js' && fileName.match(/\.js$/)) {
      console.log('Loading controller ' + moduleName);
      registerController(moduleName, server);
    }
  });
};
