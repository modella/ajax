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

    sync.get = function(id, cb) {
      var url = sync.baseUrl + '/' + id;
      request.get(url, function(res) {
        cb(res.error, res.body);
      });
    };

    sync.removeAll = function(fn) {
      var url = sync.baseUrl;
      request.del(url, function(res) {
        fn(res.error, res.body);
      });
    };

    sync.save = function(fn) {
      var url = sync.baseUrl;

      request
      .post(url)
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.update = function(fn) {
      var url = sync.baseUrl + "/" + this.primary();

      request
      .post(url)
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };
  }

  return function(Model) {
    Model.sync = sync;
    Model.sync.baseUrl = baseUrl;
    pluralResource(sync);
  };
};

