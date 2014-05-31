var services
  , async = require('async');

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
              res.status(403)
              services.renderRes( req, res, '403' );
          } else {
              res.status(401)
              services.renderRes( req, res, '401' );
          }
        } else if (page) {
          services.findPageChildren(page, function (err, pageChildren) {
            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else {
              services.renderRes(
                  req, res, (req.isAuthenticated() && req.query.action === 'edit') ? 'pageEditable' : 'page'
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
          req.isAuthenticated() &&
          req.user.isMemberOf(services.userGroups.getBySystemTitle('editor'))
        ) {
          page = new models.Page();
          page.title = path.basename(req._parsedUrl.pathname);
          page.publishedAt = (new Date()).toISOString();
          services.renderRes(
              req, res, 'pageEditable'
            , { page: page }
          );
        } else {
          services.findPageByUrl('/404', function (err, page) {
            if (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            } else {
              res.status(404);
              services.renderRes(
                  req, res, '404'
                , { page: page }
              );
            }
          });
        }
      }
  );
}
