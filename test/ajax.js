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
});
