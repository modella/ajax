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

  function pluralResource(sync) {
    sync.all = function(query, cb) {
      var Model = this;
      var url = urlForAction.call(this, 'list');
      if (typeof query === 'function') {
        cb = query;
        query = {};
      }
      request.get(url)
      .query(query)
      .set('Accept', 'application/json')
      .end(function(res) {
        Model.emit('ajaxParseAllBody', res);
        var instances = [];
        if (res.body instanceof Array) {
          for (var len = res.body.length, i=0; i<len; i++) {
            instances.push(new Model(res.body[i]));
          }
        }
        cb(errorForRes(res), instances);
      });
    };

    sync.get = function(extras, cb) {
      var Model = this;
      var url = urlForAction.call(this, 'read', extras);
      request.get(url)
      .set('Accept', 'application/json')
      .end(function(res) {
        Model.emit('ajaxParseGetBody', res);
        var instance = new Model(res.body);
        cb(errorForRes(res), instance);
      });
    };

    sync.removeAll = function(query, fn) {
      var Model = this;
      var url = urlForAction.call(this, 'removeAll');
      if (typeof query === 'function') {
        fn = query;
        query = {};
      }
      request.del(url)
      .type(sync.type)
      .query(query)
      .set('Accept', 'application/json')
      .end(function(res) {
        Model.emit('ajaxParseRemoveAllBody', res);
        fn(errorForRes(res), res.body);
      });
    };

    sync.save = function(fn) {
      var url = urlForAction.call(this, 'create');

      request
      .post(url)
      .type(sync.type)
      .set('Accept', 'application/json')
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
    extend(Model, sync);
  };

  function urlForAction(action, extras) {
    var url = sync.urlMap[action];

    if(typeof extras != 'object' && typeof extras != 'undefined')
      url = url.replace(/:primary/g, extras);

    var self = this;
    url = url.replace(/:(\w+)/g, function(match, attr) {
      if(typeof extras == 'object' && extras[attr])
        return extras[attr];
      return self[attr]();
    });
    return sync.baseUrl + url;
  }
};

function errorForRes(res) {
  var error;

  if(error = res.error) {
    if(res.body) {
      error.errors = res.body.errors;
      error.body = res.body;
      error.message = res.body.msg || error.message;
    }
    return error;
  } else
    return null;

}

