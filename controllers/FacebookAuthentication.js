var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , models = require('../models')
  , services = require('../services')
  , allSiteSettings = services.siteSettings.getAll();

if (!allSiteSettings.facebookAppId || !allSiteSettings.facebookAppSecret) {
  if (!allSiteSettings.facebookAppId) {
    console.error('Could not setup Facebook authentication as the setting "facebookAppId" is missing.');
  }

  if (!allSiteSettings.facebookAppId) {
    console.error('Could not setup Facebook authentication as the setting "facebookAppSecret" is missing.');
  }
} else {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    models.User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy(
      {
          clientID: allSiteSettings.facebookAppId
        , clientSecret: allSiteSettings.facebookAppSecret
        , callbackURL: '/login/callback'
      }
    , function(accessToken, refreshToken, profile, callback) {
        var userData = {
                facebookId: profile.id
              , firstName: profile.name.givenName
              , lastName: profile.name.familyName
              , image: 'https://graph.facebook.com/' + profile.id + '/picture?type=square'
            }
          , propertyName = '';

        models.User.findOne({ facebookId: userData.facebookId }, function (err, user) {
          if (err) {
            callback(err);
          } else if (user) {
            for (propertyName in userData) {
              if (userData.hasOwnProperty(propertyName)) {
                user[propertyName] = userData[propertyName];
              }
            }
            user.save(function (err) {
              callback(err, err ? null : user);
            });
          } else {
            user = new models.User(userData);
            user.save(function (err) {
              callback(err, err ? null : user);
            });
          }
        });
      }
  ));

  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  module.exports['GET /login'] = passport.authenticate(
      'facebook'
  );

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  module.exports['GET /login/callback'] = passport.authenticate(
      'facebook'
    , { successRedirect: '/', failureRedirect: '/', failureFlash: true }
  );

  // Logout
  module.exports['GET /logout'] = function (req, res) {
    req.logout();
    res.redirect('/');
  };
}
