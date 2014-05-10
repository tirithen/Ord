module.exports = function (res, data) {
  data = data || {};
  res.set({ 'Content-Type': 'application/json; charset=utf-8' });
  res.send(data);
};
