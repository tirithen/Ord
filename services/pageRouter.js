var services
  , models = require('../models')
  , path = require('path')
  , async = require('async');

function requestUserHasWritePermissions(req, page) {
  if (!req.isAuthenticated()) {
    return false;
  } else if (
    req.user.isMemberOf('administrator') ||
    (page && page.isWritableBy(user)) ||
    services.userGroups.userIsMemberOfOneOrMore(req.user, models.Page.createUserGroups || 'editor')
  ) {
    return true;
  } else {
    return false;
  }
}

module.exports = function (req, res) {
  if (!services) {
    services = require('./');
  }

  async.parallel(
      [
          function (callback) { services.findPageByUrl(req.url, callback) }
      ]
    , function (err, results) {
        var page = results[0];

        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else if (page && !page.isReadibleBy(req.user)) {
          // TODO: figure out if there would be a better option to send 404 to hide the pages entirely for unauthorized users
          if (req.isAuthenticated()) {
              res.status(403);
              services.renderRes(req, res, '403');
          } else {
              res.status(401);
              services.renderRes(req, res, '401');
          }
        } else if (page) {
          services.findPageChildren(page, function (err, pageChildren) {
            pageChildren = pageChildren.filter(function (pageChild) {
              return pageChild.isReadibleBy(req.user);
            });

            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else if(req.query.action === 'edit') {
              if (requestUserHasWritePermissions(req, page)) {
                services.renderRes(
                    req, res, 'pageEditable'
                  , {
                        page: page
                      , pageChildren: pageChildren
                      , userGroups: services.userGroups.getAll().map(function (userGroup) {
                          return { _id: userGroup._id, title: userGroup.title };
                        })
                    }
                );
              } else if (req.isAuthenticated()) {
                res.status(403);
                services.renderRes(req, res, '403');
              } else {
                res.status(401);
                services.renderRes(req, res, '401');
              }
            } else {
              services.renderRes(
                  req, res, 'page'
                , {
                      page: page
                    , pageChildren: pageChildren
                  }
              );
            }
          });
        } else if(
          !page &&
          req.query.action === 'new' &&
          requestUserHasWritePermissions(req)
        ) {
          page = new models.Page();

          if (req.path === '/') {
            page.isFrontPage = true;
            page.showInMenu = false;
          } else {
            page.isFrontPage = false;
            page.showInMenu = true;
          }

          page._id = null;
          page.title = decodeURIComponent(path.basename(req._parsedUrl.pathname));
          page.publishedAt = (new Date()).toISOString();

          services.renderRes(
              req, res, 'pageEditable'
            , {
                  page: page
                , userGroups: services.userGroups.getAll().map(function (userGroup) {
                    return { _id: userGroup._id, title: userGroup.title };
                  })
              }
          );
        } else {
          res.status(404);
          services.renderRes(
              req, res, '404'
            , { allowedToCreatePage: requestUserHasWritePermissions(req) }
          );
        }
      }
  );
}
