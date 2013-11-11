# Modella Ajax Sync Layer

Provides a AJAX Sync Layer for [modella](https://github.com/modella/modella). Uses [visionmedia/superagent](https://github.com/visionmedia/superagent) as a request library.

## Installation

`modella-ajax` can be used either client or server side. 

To install it client side:

    component install modella/modella-ajax

To install it server side:

    npm install modella-ajax


## Usage

As a sync layer for modella, most of `modella-ajax`, most of its usage is abstracted away from direct usage. You simply install
the plugin and use it in modella. You must specify the API end point when using ajaxSync.

    var modella  = require('modella'),
        ajaxSync = require('modella-ajax');

    var User = modella('User').attr('id').attr('username');

    // For a local API

    User.use(ajaxSync('/users'));

    // Or for a remote API

    User.use(ajaxSync('http://example.com/users'));

## API Expectations

`modella-ajax` expects you to implement a RESTful API at the end-point specified. For example in the case of `User.use(ajaxSync('/users'))` it would expect the following JSON API.

    GET      /users       // Return a JSON list of all users
    POST     /users       // Creates a new user. Returns JSON of that User

    GET      /users/id    // Return a JSON user object
    PUT      /users/id    // Updates an existing user. Returns JSON of that user
    DELETE   /users/id    // Destroys a user

Additionally, you can "Remove all" with the following HTTP Request:

    DELETE   /users/      // Destroys all users

All of these methods are optional but you will not be able to use modella's depending methods without first making an API
that responds to the appropriate patterns.

## Defining Alternative Routes

You can specify different routes than the defaults by passing in a second
optional argument to `modella-ajax`. 

### Defaults
The default urlMap looks like the following (and maps to the API expectations above).

    sync.urlMap = {
      create:     '',
      list:       '',
      read:       '/:primary',
      remove:     '/:primary',
      removeAll:  '',
      update:     '/:primary'
    };

### Overriding

If you wanted to override them, you could do so in the following way:

    var ajax = require('modella-ajax')('/api/v1/users', {
      read: '/:username',
      update: '/:username',
      remove: '/:username'
    });
    
    User.use(ajax);

This would make it so that the following routes were used:

    READ   ->  GET /api/v1/users/:username
    UPDATE ->  PUT /api/v1/users/:username
    REMOVE ->  DEL /api/v1/users/:username

### Events

#### ajax all

Emitted before `Model.all()` instantiates the model instances.

    User.on('ajax all', function(res) {
        var users = res.body.results;
        // Convert JSON string dates into actual dates
        users.forEach(u) {
           u.registeredAt = new Date(u.registeredAt);
        }
        res.body = users;
    });

#### ajax get

Emitted before `Model.get()` instantiates the model instance.

    User.on('ajax get', function(res) {
      res.body.registeredAt = new Date(res.body.registeredAt);
    });

#### ajax removeAll

Emitted before `Model.removeAll()` passes response to callback.

#### ajax save

Emitted before `model.save()` passes response to callback.

#### ajax update

Emitted before `model.update()` passes response to callback.

#### ajax remove

Emitted before `model.remove()` passes response to callback.

### Gotchyas

Worth noting that if you specify an attribute for `READ`, you must pass it in
when querying. For example:

    User.get({username: 'bobby'}, function(err, u) { }) ;

If a string is passed into get, it will try and replace `:primary` with it in
the route. For Example:

    User.get('1234', function(err, u) { }) ;

Wouldn't do anything because our routes wouldn't match up. You would need to
specify a route of `read: "/:primary"`.


Lastly, extra parameters passed into `Model.get` are not maintained unless
they are in the route. For example:

    User.get({username: 'tommy', age: 22})
 
 Would still map to `GET /api/v1/users/tommy`.

### Request header

Set the header object passed to
[superagent](http://visionmedia.github.io/superagent/):

    Use.use(require('modella-ajax')('/users', null, {
      Accept: 'application/json',
      Content-Type: 'application/json'
    });

## Todo

- implement API key usage
- allow for usage of query strings w/ modellas all method
