var request = require('superagent');

module.exports = function(baseUrl) {
  var sync = { };
  sync.urlMap = {
    create:     ':base',
    list:       ':base',
    read:       ':base/:id',
    remove:     ':base/:id',
    removeAll:  ':base',
    update:     ':base/:id'
  };
  sync.name = 'ajax';

  function pluralResource(sync) {
    sync.all = function(cb) {
      var url = urlForAction.call(this, 'list');
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(res.error, res.body);
      });
    };

    sync.get = function(id, cb) {
      var url = urlForAction.call(this, 'read', id);
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(res.error, res.body);
      });
    };

    sync.removeAll = function(fn) {
      var url = urlForAction.call(this, 'removeAll');
      request.del(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.save = function(fn) {
      var url = urlForAction.call(this, 'create');

      request
      .post(url)
      .set('Accept', 'application/json')
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.update = function(fn) {
      var url = urlForAction.call(this, 'update');

      request
      .put(url)
      .set('Accept', 'application/json')
      .send(this.toJSON())
      .end(function(res) {
        fn(res.error, res.body);
      });
    };

    sync.remove = function(fn) {
      var url = urlForAction.call(this, 'remove');

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

  function urlForAction(action, id) {
    var url = sync.urlMap[action];
    url = url.replace(/:base/, sync.baseUrl);
    if(this.primary && id === undefined)
      id = this.primary();

    url = url.replace(/:id/, id);
    return url;
  }
};

