module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send(
      'Unauthorized, please <a href="/login">login</a> brefore visiting this address.' +
      '<script>window.location.href="/login"</script>'
    );
  }
};
