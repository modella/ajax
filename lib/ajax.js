var request = require('superagent');

module.exports = function(baseUrl) {
  var sync = { };
  sync.name = 'ajax';

  function pluralResource(sync) {
    sync.all = function(cb) {
      var url = sync.baseUrl;
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(res.error, res.body);
      });
    };

    sync.get = function(id, cb) {
      var url = sync.baseUrl + '/' + id;
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(res.error, res.body);
      });
    };

    sync.removeAll = function(fn) {
      var url = sync.baseUrl;
      request.del(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.save = function(fn) {
      var url = sync.baseUrl;

      request
      .post(url)
      .set('Accept', 'application/json')
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.update = function(fn) {
      var url = sync.baseUrl + "/" + this.primary();

      request
      .put(url)
      .set('Accept', 'application/json')
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.remove = function(fn) {
      var url = sync.baseUrl + "/" + this.primary();

      request.del(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        fn(res.error, res.body);
      });
    };
  }

  return function(Model) {
    sync.baseUrl = baseUrl;
    pluralResource(sync);
    Model._sync = sync;
  };
};

