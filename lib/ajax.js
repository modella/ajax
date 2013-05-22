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
  sync.type = 'json';
  sync.name = 'ajax';
  sync.slugName = 'primary';

  function pluralResource(sync) {
    sync.all = function(cb) {
      var url = urlForAction.call(this, 'list');
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(errorForRes(res), res.body);
      });
    };

    sync.get = function(id, cb) {
      var url = urlForAction.call(this, 'read', id);
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(errorForRes(res), res.body);
      });
    };

    sync.removeAll = function(fn) {
      var url = urlForAction.call(this, 'removeAll');
      request.del(url)
      .set('Accept', 'application/json')
      .type(sync.type)
      .end(function(res) {
        fn(errorForRes(res), res.body);
      });
    };

    sync.save = function(fn) {
      var url = urlForAction.call(this, 'create');

      request
      .post(url)
      .set('Accept', 'application/json')
      .type(sync.type)
      .send(this.toJSON())
      .end(function(res) {
        fn(errorForRes(res), res.body);
      });
    };

    sync.update = function(fn) {
      var url = urlForAction.call(this, 'update');

      request
      .put(url)
      .set('Accept', 'application/json')
      .type(sync.type)
      .send(this.toJSON())
      .end(function(res) {
        fn(errorForRes(res), res.body);
      });
    };

    sync.remove = function(fn) {
      var url = urlForAction.call(this, 'remove');

      request.del(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        fn(errorForRes(res), res.body);
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
    if(this[sync.slugName] && typeof id != 'string')
      id = this[sync.slugName]();

    url = url.replace(/:id/, id);
    return url;
  }
};

function errorForRes(res) {
  var error;

  if(error = res.error) {
    error.errors = res.body.errors;
    error.body = res.body;
    error.message = res.body.msg || error.message;
    return error;
  } else
    return null;

}

