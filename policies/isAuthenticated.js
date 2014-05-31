module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401);
    services.renderRes(req, res, '401');
  }
};
