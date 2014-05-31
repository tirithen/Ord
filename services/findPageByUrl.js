var models = require('../models')
  , url = require('url')
  , async = require('async');

module.exports = function (urlQuery, callback) {
  var query = {};

  urlQuery = url.parse(urlQuery);
  urlQuery = decodeURIComponent(urlQuery.pathname).trim().replace(/^\/+/, '').split('/');

  query.title = urlQuery[urlQuery.length - 1];
  if (query.title === '') {
    delete query.title;
    query.isFrontPage = true;
  }

  if (urlQuery.length === 1) {
    query.parent = null;
  }

  models.Page
    .find(query)
    .populate('parent createdBy updatedBy readibleBy writableBy')
    .exec(function (err, pages) {
      var pageResult;

      if (err) {
        callback(err);
      } else {
        models.Page.populate(pages, { path: 'parent.parent' }, function (err, pages) {
          if (!err && Array.isArray(pages)) {
            pages.forEach(function (page) {
              var level = page.isFrontPage ? -1 : urlQuery.length - 1;

              if (!pageResult) {
                pageResult = page;
                pageResult.breadcrumbs = [];

                while (page && level >= 0 && page.title === urlQuery[level]) {
                  level -= 1;
                  pageResult.breadcrumbs.unshift(page);
                  page = page.parent;
                }

                if (level !== -1) {
                  pageResult = null;
                }
              }
            });
          }

          callback(err, pageResult);
        });
      }
    });
};
