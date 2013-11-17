var request = require('superagent'),
    modella = require('modella'),
    extend = require('extend');

module.exports = function(baseUrl, urlOverrides) {
  var header = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var urlMap = extend({
    create:     '',
    list:       '',
    read:       '/:primary',
    remove:     '/:primary',
    removeAll:  '',
    update:     '/:primary'
  }, urlOverrides);

  return function(Model) {
    Model.baseUrl = baseUrl;

    Model.all = function(query, cb) {
      var url = urlForAction.call(this, 'list');
      if (typeof query === 'function') {
        cb = query;
        query = {};
      }
      var req = request.get(url).query(query).set(header);
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax all', res);
        var instances = [];
        if (res.body instanceof Array) {
          for (var len = res.body.length, i=0; i<len; i++) {
            instances.push(new Model(res.body[i]));
          }
        }
        cb(errorForRes(res), instances);
      });
    };

    Model.get = function(extras, cb) {
      var url = urlForAction.call(this, 'read', extras);
      var req = request.get(url).set(header);
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax get', res);
        var instance = new Model(res.body);
        cb(errorForRes(res), instance);
      });
    };

    Model.removeAll = function(query, fn) {
      var url = urlForAction.call(this, 'removeAll');
      if (typeof query === 'function') {
        fn = query;
        query = {};
      }
      var req = request.del(url).query(query).set(header);
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax removeAll', res);
        fn(errorForRes(res), res.body);
      });
    };

    Model.save = function(fn) {
      var url = urlForAction.call(this, 'create');
      var req = request.post(url).set(header).send(this.toJSON());
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax save', res);
        fn(errorForRes(res), res.body);
      });
    };

    Model.update = function(fn) {
      var url = urlForAction.call(this, 'update');
      var req = request.put(url).set(header).send(this.toJSON());
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax update', res);
        fn(errorForRes(res), res.body);
      });
    };

    Model.remove = function(fn) {
      var url = urlForAction.call(this, 'remove');
      var req = request.del(url);
      Model.emit('ajax request', req);
      req.end(function(res) {
        Model.emit('ajax remove', res);
        fn(errorForRes(res), res.body);
      });
    };
  }

  function urlForAction(action, extras) {
    var url = urlMap[action];

    if(typeof extras != 'object' && typeof extras != 'undefined')
      url = url.replace(/:primary/g, extras);

    var self = this;
    url = url.replace(/:(\w+)/g, function(match, attr) {
      if(typeof extras == 'object' && extras[attr])
        return extras[attr];
      return self[attr]();
    });
    return baseUrl + url;
  }
};

function errorForRes(res) {
  var error;

  if(error = res.error) {
    if(res.body) {
      error.errors = res.body.errors;
      error.body = res.body;
      error.message = res.body.msg || error.message;
      error.res = res;
    }
    return error;
  } else
    return null;

}

