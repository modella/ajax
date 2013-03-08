var request = require('superagent');

module.exports = function(baseUrl) {
  var sync = { };
  sync.name = 'ajax';

  function pluralResource(sync) {
    sync.all = function(cb) {
      var url = sync.baseUrl;
      request.get(url, function(res) {
        cb(res.error, res.body);
      });
    };
  }

  return function(Model) {
    Model.sync = sync;
    Model.sync.baseUrl = baseUrl;
    pluralResource(sync);
  };
};

