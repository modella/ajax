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


## Todo

- implement API key usage
- allow for usage of query strings w/ modellas all method
