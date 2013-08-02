var request = require('superagent'),
    modella = require('modella'),
    extend = require('extend');

module.exports = function(baseUrl, urlOverrides) {
  var sync = { };

  sync.urlMap = extend({
    create:     '',
    list:       '',
    read:       '/:primary',
    remove:     '/:primary',
    removeAll:  '',
    update:     '/:primary'
  }, urlOverrides);

  sync.type = 'json';
  sync.name = 'ajax';

  function pluralResource(sync) {
    sync.all = function(cb) {
      var url = urlForAction.call(this, 'list');
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        cb(errorForRes(res), res.body);
      });
    };

    sync.get = function(extras, cb) {
      var url = urlForAction.call(this, 'read', extras);
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

  function urlForAction(action, extras) {
    var url = sync.urlMap[action];

    if(typeof extras == 'string')
      url = url.replace(/:primary/g, extras);

    url = url.replace(/:(\w+)/g, function(match, attr) {
      if(typeof extras == 'object' && extras[attr])
        return extras[attr];
      return this[attr]();
    });
    return sync.baseUrl + url;
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

