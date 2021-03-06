var expect = require('expect.js');
var sync = require('../');
var User = require('modella')('User').attr('id').attr('name');
var superagent = require('superagent');

User.use(sync('/users'));

describe("Ajax Sync", function() {
  it("sets the base url", function() {
    expect(User.baseUrl).to.be('/users');
  });

  describe(".all()", function() {

    it("does a GET request to the base url", function(done) {
      var get = superagent.get;
      var superagentApi = {
        query: function(query) {
          expect(query).to.eql({});
          return this;
        },
        set: function () { return this; },
        end: function(cb) { cb([{}]); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      User.all(function() {
        superagent.get = get;
        done();
      });
    });

    it("passes query to superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        query: function(query) {
          expect(query).to.eql({ name: "bob" });
          return this;
        },
        set: function () { return this; },
        end: function(cb) { cb({}); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      User.all({ name: "bob" }, function() {
        superagent.get = get;
        done();
      });
    });

    it("sets header for request", function(done) {
      var get = superagent.get;
      var superagentApi = {
        query: function() { return this; },
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        end: function(cb) { cb({error: null, body: [{id: "0", name: "Bob"}, {id: "1", name: "Tobi"}]}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };
      User.all(function(err, body) {
        expect(err).to.be(null);
        superagent.get = get;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb({error: null, body: [{id: "0", name: "Bob"}, {id: "1", name: "Tobi"}]}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };

      User.all(function(err, body) {
        expect(err).to.be(null);
        expect(body).to.have.length(2);
        superagent.get = get;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb({error: true, body: undefined}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };

      User.all(function(err, body) {
        expect(err).to.be(true);
        superagent.get = get;
        done();
      });
    });

    it('emits "ajax all" event', function(done) {
      var get = superagent.get;
      var superagentApi = {
        type:  function () { return this; },
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb([]); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };
      User.once('ajax all', function(res) {
        superagent.get = get;
        expect(res).to.be.an('array');
        done();
      });
      User.all(function() {});
    });

    it('emits "ajax request" event', function(done) {
      var get = superagent.get;
      var superagentApi = {
        type:  function () { return this; },
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb([]); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };
      User.once('ajax request', function(req) {
        superagent.get = get;
        expect(req).to.have.keys('type', 'query', 'set', 'end');
        done();
      });
      User.all(function() {});
    });
  });

  describe(".get()", function() {

    it("does a GET request to the base url with the ID", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function () { return this; },
        end: function(cb) { cb({}); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users/1');
        return superagentApi;
      };

      User.get(1, function() {
        superagent.get = get;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function () { return this; },
        end: function(cb) { cb({error: null, body: {id: "1", name: "Bob"}}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };

      User.get(1, function(err, body) {
        expect(err).to.be(null);
        expect(body.toJSON()).to.have.property('id', '1');
        superagent.get = get;
        done();
      });
    });

    it("sets header for request", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        end: function(cb) { cb({error: null, body: {id: 1, name: "Bob"}}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };
      User.get(1, function(err, user) {
        expect(err).to.be(null);
        expect(user).to.be.a(User);
        expect(user).to.have.property('attrs');
        expect(user.attrs).to.have.property('id', 1);
        expect(user.primary()).to.be(1);
        superagent.get = get;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function () { return this; },
        end: function(cb) { cb({error: true, body: undefined}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };

      User.get(1, function(err, body) {
        expect(err).to.be(true);
        superagent.get = get;
        done();
      });
    });

    it('emits "ajax get" event', function(done) {
      var get = superagent.get;
      var superagentApi = {
        type:  function () { return this; },
        set: function () { return this; },
        end: function(cb) { cb({ body: {id: 1} }); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users/1');
        return superagentApi;
      };
      User.once('ajax get', function(res) {
        superagent.get = get;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('id', 1);
        done();
      });
      User.get(1, function() {});
    });

    it('emits "ajax request" event', function(done) {
      var get = superagent.get;
      var superagentApi = {
        type:  function () { return this; },
        set: function () { return this; },
        end: function(cb) { cb({ body: {id: 1} }); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users/1');
        return superagentApi;
      };
      User.once('ajax request', function(req) {
        superagent.get = get;
        expect(req).to.have.keys('type', 'set', 'end');
        done();
      });
      User.get(1, function() {});
    });
  });

  describe(".removeAll()", function() {
    it("does a DELETE request to the base URL", function(done) {
      var del = superagent.del;
      var superagentApi = {
        query: function(query) {
          expect(query).to.eql({});
          return this;
        },
        set: function () { return this; },
        end: function(cb) { cb({}); }
      };
      superagent.del = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      User.removeAll(function() {
        superagent.del = del;
        done();
      });
    });

    it("passes query to superagent", function(done) {
      var del = superagent.del;
      var superagentApi = {
        query: function(query) {
          expect(query).to.eql({ name: "bob" });
          return this;
        },
        set: function () { return this; },
        end: function(cb) { cb({}); }
      };
      superagent.del = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      User.removeAll({ name: "bob" }, function() {
        superagent.del = del;
        done();
      });
    });

    it("sets header for request", function(done) {
      var del = superagent.del;
      var superagentApi = {
        query: function(query) {
          expect(query).to.eql({ name: "bob" });
          return this;
        },
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        end: function(cb) { cb({}); }
      };
      superagent.del = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };
      User.removeAll({ name: "bob" }, function() {
        superagent.del = del;
        done();
      });
    });

    it("forwards on errors from superagent", function(done) {
      var del = superagent.del;
      var superagentApi = {
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb({error: true}); }
      };
      superagent.del = function(url) {
        return superagentApi;
      };

      User.removeAll(function(error) {
        expect(error).to.be(true);
        superagent.del = del;
        done();
      });
    });

    it('emits "ajax removeAll" event', function(done) {
      var del = superagent.del;
      var superagentApi = {
        type:  function () { return this; },
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb({ status: 204 }); }
      };
      superagent.del = function(url) {
        return superagentApi;
      };
      User.once('ajax removeAll', function(res) {
        superagent.del = del;
        expect(res).to.have.property('status', 204);
        done();
      });
      User.removeAll(function() {});
    });

    it('emits "ajax request" event', function(done) {
      var del = superagent.del;
      var superagentApi = {
        type:  function () { return this; },
        query: function() { return this; },
        set: function () { return this; },
        end: function(cb) { cb({ status: 204 }); }
      };
      superagent.del = function(url) {
        return superagentApi;
      };
      User.once('ajax request', function(req) {
        superagent.del = del;
        expect(req).to.have.keys('type', 'set', 'query', 'end');
        done();
      });
      User.removeAll(function() {});
    });
  });

  describe(".save()", function() {
    it("does a POST request to the base URL", function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({}); }
      };
      superagent.post = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      var user = new User();
      user.name('Bob');
      user.save(function() {
        superagent.post = post;
        done();
      });
    });

    it("POSTs the attributes of the model", function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function (data) {
          expect(data).to.have.property('name', 'Bob');
          return this;
        },
        end:  function(cb) { cb({}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };

      var user = new User();
      user.name('Bob');
      user.save(function() {
        superagent.post = post;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {id: "513"}}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };

      var user = new User();
      user.name('Bob');
      user.save(function(err) {
        expect(user.id()).to.be("513");
        superagent.post = post;
        done();
      });
    });

    it("sets header for request", function(done) {
      var post = superagent.post;
      var superagentApi = {
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        send: function () { return this; },
        end:  function(cb) { cb({body: {id: 513}}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };

      var user = new User();
      user.name('Bob');
      user.save(function(err) {
        expect(user.id()).to.be(513);
        superagent.post = post;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({error: true}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };

      var user = new User();
      user.name('Bob');
      user.save(function(err) {
        expect(err).to.be(true);
        superagent.post = post;
        done();
      });
    });

    it('emits "ajax save" event', function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {id: 513}}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };
      var user = new User().name('Bob');
      User.once('ajax save', function(res) {
        superagent.post = post;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('id', 513);
        done();
      });
      user.save(function() {});
    });

    it('emits "ajax request" event', function(done) {
      var post = superagent.post;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {id: 513}}); }
      };
      superagent.post = function(url) {
        return superagentApi;
      };
      var user = new User().name('Bob');
      User.once('ajax request', function(req) {
        superagent.post = post;
        expect(req).to.have.keys('set', 'send', 'end');
        done();
      });
      user.save(function() {});
    });
  });

  describe(".update()", function() {
    it("does a PUT request to the base URL with the ID", function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({}); }
      };
      superagent.put = function(url) {
        expect(url).to.be('/users/1');
        return superagentApi;
      };

      var user = new User({id: "1"});
      user.name('Bob');
      user.save(function() {
        superagent.put = put;
        done();
      });
    });

    it("PUTs the attributes of the model", function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function (data) {
          expect(data).to.have.property('name', 'Bob');
          return this;
        },
        end:  function(cb) { cb({}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "1"});
      user.name('Bob');
      user.save(function() {
        superagent.put = put;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {name: "Bobby"}}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.name('Bob');
      user.save(function(err) {
        expect(user.name()).to.be("Bobby");
        superagent.put = put;
        done();
      });
    });

    it("sets header for requst", function(done) {
      var put = superagent.put;
      var superagentApi = {
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        send: function () { return this; },
        end:  function(cb) { cb({body: {name: "Bobby"}}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.name('Bob');
      user.save(function(err) {
        expect(user.name()).to.be("Bobby");
        superagent.put = put;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({error: true}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.name('Bob');
      user.save(function(err) {
        expect(err).to.be(true);
        superagent.put = put;
        done();
      });
    });

    it('emits "ajax update" event', function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {name: "Bobby"}}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "123"}).name('Bob');
      User.once('ajax update', function(res) {
        superagent.put = put;
        expect(res.body.name).to.be("Bobby");
        done();
      });
      user.save(function () {});
    });

    it('emits "ajax request" event', function(done) {
      var put = superagent.put;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({body: {name: "Bobby"}}); }
      };
      superagent.put = function(url) {
        return superagentApi;
      };

      var user = new User({id: "123"}).name('Bob');
      User.once('ajax request', function(req) {
        superagent.put = put;
        expect(req).to.have.keys('set', 'send', 'end');
        done();
      });
      user.save(function () {});
    });
  });

  describe(".remove()", function() {
    it("does a DELETE request to the base url with the ID", function(done) {
      var del = superagent.del;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({}); }
      };
      superagent.del = function(url, cb) {
        expect(url).to.be('/users/123');
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.remove(function() {
        superagent.del = del;
        done();
      });
    });

    it("sets header for request", function(done) {
      var del = superagent.del;
      var superagentApi = {
        set: function (header) {
          expect(header).to.have.property('Accept', 'application/json');
          return this;
        },
        send: function () { return this; },
        end:  function(cb) { cb({}); }
      };
      superagent.del = function(url, cb) {
        expect(url).to.be('/users/123');
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.remove(function() {
        superagent.del = del;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var del = superagent.del;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({error: true}); }
      };
      superagent.del = function(url, cb) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      user.remove(function(err) {
        expect(err).to.be(true);
        superagent.del = del;
        done();
      });
    });

    it('emits "ajax remove" event', function(done) {
      var del = superagent.del;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({ status: 204 }); }
      };
      superagent.del = function(url, cb) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      User.once('ajax remove', function(res) {
        superagent.del = del;
        expect(res).to.have.property('status', 204);
        done();
      });
      user.remove(function() {});
    });

    it('emits "ajax request" event', function(done) {
      var del = superagent.del;
      var superagentApi = {
        set:  function () { return this; },
        send: function () { return this; },
        end:  function(cb) { cb({ status: 204 }); }
      };
      superagent.del = function(url, cb) {
        return superagentApi;
      };

      var user = new User({id: "123"});
      User.once('ajax request', function(req) {
        superagent.del = del;
        expect(req).to.have.keys('set', 'send', 'end');
        done();
      });
      user.remove(function() {});
    });

  });
});
