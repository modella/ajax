var expect = require('expect.js');
var sync = require('../');
var User = require('modella')('User').attr('id').attr('name');
var superagent = require('superagent');

User.use(sync('/users'));

describe("Ajax Sync", function() {
  it("sets sync", function() {
    expect(User.sync).to.be.ok();
  });

  it("sets the sync name", function() {
    expect(User.sync.name).to.be('ajax');
  });

  it("sets the base url", function() {
    expect(User.sync.baseUrl).to.be('/users');
  });

  describe(".all()", function() {

    it("does a GET request to the base url", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function () { return this; },
        end: function(cb) { cb({}); }
      };
      superagent.get = function(url) {
        expect(url).to.be('/users');
        return superagentApi;
      };

      User.sync.all(function() {
        superagent.get = get;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var get = superagent.get;
      var superagentApi = {
        set: function () { return this; },
        end: function(cb) { cb({error: null, body: [{id: "0", name: "Bob"}, {id: "1", name: "Tobi"}]}); }
      };
      superagent.get = function(url) {
        return superagentApi;
      };

      User.sync.all(function(err, body) {
        expect(err).to.be(null);
        expect(body).to.have.length(2);
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

      User.sync.all(function(err, body) {
        expect(err).to.be(true);
        superagent.get = get;
        done();
      });
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

      User.sync.get(1, function() {
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

      User.sync.get(1, function(err, body) {
        expect(err).to.be(null);
        expect(body).to.have.property('id', '1');
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

      User.sync.get(1, function(err, body) {
        expect(err).to.be(true);
        superagent.get = get;
        done();
      });
    });
  });

  describe(".removeAll()", function() {
    it("does a DELETE request to the base URL", function(done) {
      var del = superagent.del;
      var superagentApi = {
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

    it("forwards on errors from superagent", function(done) {
      var del = superagent.del;
      var superagentApi = {
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
  });
});
