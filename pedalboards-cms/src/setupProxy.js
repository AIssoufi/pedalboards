const proxy = require('http-proxy-middleware');

module.exports = function (app) {
  console.log("setupProxy")
  var api = proxy({
    target: process.env.REACT_APP_CORE_SERVICE + '/api',
    changeOrigin: true
  });
  var frontend = proxy({
    target: process.env.REACT_APP_FRONTEND + '/plugin',
    changeOrigin: true
  });
  app.use('/api/**', api);
  app.use('/plugin/**', frontend);
};