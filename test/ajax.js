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
      superagent.get = function(url, cb) {
        expect(url).to.be('/users');
        cb({});
      };

      User.sync.all(function() {
        superagent.get = get;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var get = superagent.get;
      superagent.get = function(url, cb) {
        cb({error: null, body: [{id: "0", name: "Bob"}, {id: "1", name: "Tobi"}]});
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
      superagent.get = function(url, cb) {
        cb({error: true, body: undefined});
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
      superagent.get = function(url, cb) {
        expect(url).to.be('/users/1');
        cb({});
      };

      User.sync.get(1, function() {
        superagent.get = get;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var get = superagent.get;
      superagent.get = function(url, cb) {
        cb({error: null, body: {id: "1", name: "Bob"}});
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
      superagent.get = function(url, cb) {
        cb({error: true, body: undefined});
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
      superagent.del = function(url, cb) {
        expect(url).to.be('/users');
        cb({});
      };
      User.removeAll(function() {
        superagent.del = del;
        done();
      });
    });

    it("forwards on errors from superagent", function(done) {
      var del = superagent.del;
      superagent.del = function(url, cb) {
        expect(url).to.be('/users');
        cb({error: true});
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
      superagent.post = function(url) {
        expect(url).to.be('/users');
        return {
          send: function() {
            return { end: function(cb) {cb({}); }};
          }
        };
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
      superagent.post = function(url) {
        return {
          send: function(data) {
            expect(data).to.have.property('name', 'Bob');
            return { end: function(cb) {cb({}); }};
          }
        };
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
      superagent.post = function(url) {
        return { send: function() { return { end: function(cb) {cb({body: {id: "513"}}); }}; } };
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
      superagent.post = function(url) {
        return { send: function() { return { end: function(cb) {cb({error: true}); }}; } };
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
    it("does a POST request to the base URL with the ID", function(done) {
      var post = superagent.post;
      superagent.post = function(url) {
        expect(url).to.be('/users/1');
        return {
          send: function() {
            return { end: function(cb) {cb({}); }};
          }
        };
      };

      var user = new User({id: "1"});
      user.name('Bob');
      user.save(function() {
        superagent.post = post;
        done();
      });
    });

    it("POSTs the attributes of the model", function(done) {
      var post = superagent.post;
      superagent.post = function(url) {
        return {
          send: function(data) {
            expect(data).to.have.property('name', 'Bob');
            return { end: function(cb) {cb({}); }};
          }
        };
      };

      var user = new User({id: "1"});
      user.name('Bob');
      user.save(function() {
        superagent.post = post;
        done();
      });
    });

    it("passes along data from superagent", function(done) {
      var post = superagent.post;
      superagent.post = function(url) {
        return { send: function() { return { end: function(cb) {cb({body: {name: "Bobby"}}); }}; } };
      };

      var user = new User({id: "123"});
      user.name('Bob');
      user.save(function(err) {
        expect(user.name()).to.be("Bobby");
        superagent.post = post;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var post = superagent.post;
      superagent.post = function(url) {
        return { send: function() { return { end: function(cb) {cb({error: true}); }}; } };
      };

      var user = new User({id: "123"});
      user.name('Bob');
      user.save(function(err) {
        expect(err).to.be(true);
        superagent.post = post;
        done();
      });
    });
  });

  describe(".remove()", function() {
    it("does a DELETE request to the base url with the ID", function(done) {
      var del = superagent.del;
      superagent.del = function(url, cb) {
        expect(url).to.be('/users/123');
        cb({});
      };

      var user = new User({id: "123"});
      user.remove(function() { 
        superagent.del = del;
        done();
      });
    });

    it("passes along errors from superagent", function(done) {
      var del = superagent.del;
      superagent.del = function(url, cb) {
        cb({error: true, body: "Some Message" });
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
