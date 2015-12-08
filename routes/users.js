var express = require('express');
var router = express.Router();
var app = express();

var bodyParser = require('body-parser');
var account = require('../lib/users/utils');

var AppError = require('../lib/Err.js');
var Logger = require('../lib/Logger.js');
var util = require('util');
var db_handle = require('../models/db');
var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../models/rpc') } );
var assert = require('assert');
var get_ip = require('ipware')().get_ip;

var verify_request_body = function(req, res, buf, encoding) {
  // ...
};

var request_body_opts = {
  // Allows rich encoding of objects and arrays, i.e.: JSON
  extended: true,
  // Maximum request body size of 64KB
  limit: 65536,
  // Compressed request bodies shall be deflated, not ignored
  inflate: true,

  // TODO(jeff): Implement validation checking of the request body data;
  // parsing can be aborted if we find anything suspicious!
  verify: verify_request_body
};

form_request_parser = bodyParser.urlencoded(request_body_opts);

/* GET users listing. */
router.get('/', function(req, res, next) {
  next();
});

router.get('/login', function(req, res, next) {

  var user_authenticated = false;
  var ip = get_ip(req);

  if(req.session.user) {
    user_authenticated = true;
  }

  console.log("session auth:", user_authenticated);
  console.log("user ip:", ip.clientIp);

  var params = {
    user_id: '',
    user_password: '',
    user_authenticated: user_authenticated,
    notifications: {}
  };

  if(user_authenticated) {
    // NOTE(jeff): The user is already logged in, so we have nothing more to
    // do here!
    console.log("The user,", req.session.user, ", is already authenticated;",
                "redirecting user to the referred page.");
    // TODO(jeff): Redirect user to referrer page.
    return res.redirect('/jobs');
  }

  res.render('login', { params: params } );
});

router.post('/login', form_request_parser, function(req, res, next) {

  var action = req.body.action;
  var user_id = req.body.user_id;
  var user_password = req.body.password;
  var store_cookie = req.body.store_cookie;
  var user_authenticated = false;

  var params = {
    user_id: req.body.user_id,
    user_password: req.body.password,
    user_authenticated: user_authenticated,
    user_ip: get_ip(req).clientIp,
    notifications: []
  };

  // TODO(jeff): err notification to end-user
  if(action === 'login') {

    if(req.body.auth) {
      user_authenticated = true;
    }

    if(user_authenticated) {
      req.session.destroy( function(err) {
        if(err) {
          console.log("err:", err);
          res.render('error', { error: err } );
        }
      });
    }

    var login_callback = function(output, params) {
      var result = output;


      if(result.length == 1 && params.notifications.length === 0) {
        // NOTE(jeff): ...Successful login!

        var user_id = result[0].user_id;
        var last_login = result[0].date_edited;

        console.info("login from", user_id, "at", params.user_ip,
                     "-- last login on", last_login);

        // TODO: Update the user's last login timestamp and IP address
        rpcJs.input({
          input: {
            method: 'update_user',
            // TODO(jeff): { "last_login": time_stamp }
            params: { "user_id": result[0].user_id, "user_ip": params.user_ip }
          },
          callback: function(output) {

            // TODO(jeff): Redirect user to referrer page.
            res.redirect('/jobs');
          }
        });

        // TODO(jeff): store_cookie option

      } else {
        // Err
        console.log('err: login failure');
        res.render('login', {params: params});
      }
    };

    rpcJs.input({
      input: { method: 'list_users', params: { "user_id": user_id, "limit": 1 } },
      callback: function(output) {
        var result = output.result;

        if(result && result.length > 0) {

          // Success -- found a matching user name in the users table!
          if(result[0].user_id == user_id) {

            // Password field sent as part of the HTTP POST request
            var password_hash = account.generate_hash(user_password);
            // Password field from the users table
            var stored_password = result[0].user_password;

            // NOTE(jeff): Compare the two password hashings
            if(stored_password != password_hash) {
              console.log('err: password mismatch');

              console.info("entered password:", user_password);
              console.info("entered password (hashed):", password_hash);
              console.info("stored password:", stored_password);

              // TODO(jeff): Use connect-flash module for err notifications
              params.notifications.push('The password entered does not match. Please try again!');

              login_callback(result, params);
            } // end if password mismatch

            // NOTE(jeff): ...Successful login -- let's setup the user's
            // state session!
            req.session.user = user_id;

            params.user_authenticated = true;
            login_callback(result, params);
          } // end if user names match

        } else {
          // NOTE(jeff): No results Available

          console.log('err: user not found');
          console.info("user:", user_id);

          // TODO(jeff): Use connect-flash module for err notifications
          params.user_authenticated = false;
          params.notifications.push('The user entered could not be found. Please try again!');

          login_callback(result, params);
        }

        //
      }
    });
    console.log('login action');
  } else if(action === 'signup') {
    // TODO
    console.log('signup action');
  }
});

router.get('/logout', function(req, res, next) {
  req.session.destroy( function(err) {
    if(err) {
      console.log("err:", err);
      res.render('error', { error: err } );
    }
  });

  res.redirect('/users/login');
});

module.exports = router;
