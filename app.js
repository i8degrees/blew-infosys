// Initialize site environment variables (similar to Heroku build config vars)
//
// IMPORTANT(jeff): This should be done as early as possible!
//
// Source: https://www.npmjs.org/package/dotenv
var dotenv = require('dotenv');

// Parses variables from .env AND one of three local site files --
// .env.development, .env.testing or .env.production -- dependent on the value
// of NODE_ENV, a BASH environment variable.
dotenv.load();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var contacts_api = require('./routes/contacts');
var properties_api = require('./routes/properties');
// var users_api = require('./routes/users');
var status_api = require('./routes/status');

var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global site settings
//
// These are globally accessible once the app var has been declared and
// initialized -- see above) at `app.locals.settings` or
// `res.app.locals.settings`.
//
// Global access from within Jade templates is automatically granted at
// locals.settings.

var site_owner = {
  name: 'infosys',
  company: 'Blew & Associates',
  // TODO: This is a stubbed e-mail address; replace with the actual one before
  // production deployment!
  email: 'carp@blewinc.com',
  email: 'carp@blewinc.com',
  phone: '+1 (479) 443-4506',
  // https://developer.apple.com/library/ios/featuredarticles/iPhoneURLScheme_Reference/PhoneLinks/PhoneLinks.html
  phone_url: 'tel:1-479-443-4506',
  fax: '+1 (479) 439-8283',
  addr1: '524 W Sycamore St',
  addr2: 'Fayetteville, AR 72703',
};

var site_developer = {
  name: 'Jeffrey Carpenter',
  email: 'i8degrees@gmail.com',
  website: 'https://github.com/i8degrees/'
};

app.set('site_owner', site_owner);
app.set('site_developer', site_developer);

// Local site library configuration; **must** go before router!
app.use( function(req, res, next) {

  // TODO: Split contact_form specifics from this
  // res.locals.form_helpers = form_helpers;

  // Avoid ReferenceError by creating the container used by the form elements
  // after form submission (HTTP 'POST') ahead of time; this is necessary so we
  // can pass the object to the Jade template for a HTTP 'GET' of the contact
  // page without first checking if the req.body.<field> object exists.
  //
  // See also: http://dailyjs.com/2012/09/13/express-3-csrf-tutorial/
  res.locals.property = {};
  res.locals.job = {};

  // Page tracking (href, query, pathname)
  res.locals.loc = req._parsedUrl;

  next();
});

// IMPORTANT(jeff): Enable COR; Cross-Origin Request
app.use( cors() );

app.use('/', index);
app.use('/api', contacts_api);
app.use('/api', properties_api);
// app.use('/users', users_api);
app.use('/api', status_api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// TODO(jeff): Relocate..?
var rpc = require('rpc.js');
var rpcJS = rpc.gateway( {schema: require('./lib/api.js')} );

// TODO(jeff): Relocate..?
// HTTP-RPC server for our API
rpc.server('http', {
  port: process.env.PORT || 3001,
  address: process.env.RPC_HOST || "localhost",
  gateway: rpcJS // API Schema
});

if(app.get('env') === 'development') {

  // Jade configuration
  app.locals.pretty = true; // Human-friendly (indented) HTML output
  app.locals.compileDebug = true;
} else {
  // NOTE(jeff): Assume production mode (live, public site)

  // Jade
  app.locals.pretty = false; // Computer-friendly (no whitespace) HTML output
  app.locals.compileDebug = false;
}

module.exports = app;

var port = Number(process.env.PORT || 3000);

var server = app.listen(port, function() {
  var tcp_family = server.address().family;
  var tcp_addr = server.address().address;
  var tcp_port = server.address().port;
  console.log('Listening at TCP/IP %s: %s:%d', tcp_family, tcp_addr, tcp_port);
  console.log('Site environment: %s', app.get('env') );
  // console.log('Remote resource fetching: %s ', app.get('remote') );
});
