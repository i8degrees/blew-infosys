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

var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var enforce_ssl = require('express-sslify');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');

var index = require('./routes/index');
var contacts_api = require('./routes/contacts');
var jobs = require('./routes/jobs');
var jobs_api = require('./routes/api');
var users_api = require('./routes/users');
var status = require('./routes/status');

var cors = require('cors');

var app = express();

var ssl_opts = {};
if(app.get('env') === 'production') {
  // NOTE(jeff): Use Heroku's SSL back-end when available
  app.use( enforce_ssl.HTTPS( { trustProtoHeader: true }) );
} else {
  // NOTE(jeff): Host a self-signed certificate SSL server
  ssl_opts = {
    key: fs.readFileSync('./keys/server.key'),
    cert: fs.readFileSync('./keys/server.crt'),
    ca: fs.readFileSync('./keys/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false,
  };
}

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

// Initialize persistent data store -- user sessions and cookies
//
// NOTE(jeff): Accessible through the route's req.session variable.
//
// https://github.com/expressjs/session
// https://github.com/valery-barysok/session-file-store

var session_file_opts = {
  path: './models/sessions',
};

var session_secret = '';
if(process.env.SESSION_SECRET != null) {
  // Use environment variable set in one of the .env site files
  session_secret = process.env.SESSION_SECRET;
} else {
  // Default value for when the environment variable is **not** set
  session_secret = 'not a secure session secret!!!';
  console.warn("app [WARN]: SESSION_SECRET environment variable is not set; using insecure default!");
}

var secure_cookies = false;
if(app.get('env') === 'production') {
  app.set('trust proxy', 1);  // trust first proxy
  secure_cookies = true;
}

app.use( session({
  store: new FileStore(session_file_opts),
  secret: session_secret,
  cookie: {
    // NOTE(jeff): This means 'no expiration'. In effect, this means that the
    // end-user's cookie (and session) will be removed upon the action of
    // closing the browser.
    maxAge: null,
    // httpOnly: true,
    // NOTE(jeff): Requires HTTPS (SSL)
    secure: secure_cookies,
  },
  resave: true,
  saveUninitialized: true,
}));

// Use connect-flash module for persistent state, i.e.: passing data across
// more than one HTTP request
app.use( flash() );

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


  // res.locals.form_helpers = form_helpers;

  // Avoid ReferenceError by creating the container used by the form elements
  // after form submission (HTTP 'POST') ahead of time; this is necessary so we
  // can pass the object to the Jade template for a HTTP 'GET' of the contact
  // page without first checking if the req.body.<field> object exists.
  //
  // See also: http://dailyjs.com/2012/09/13/express-3-csrf-tutorial/
  res.locals.job = {};

  // Page tracking (href, query, pathname)
  res.locals.loc = req._parsedUrl;

  res.locals.helpers = {

    // TODO(jeff): Implement correspondence form helpers at lib/form_helpers.js
    // forms: form_helpers
  },

  res.locals.query = '';

  next();
});

// IMPORTANT(jeff): Enable COR; Cross-Origin Request
app.use( cors() );

app.use('/', index);
app.use('/jobs', jobs);
app.use('/status', status);
app.use('/users', users_api);
app.use('/api', jobs_api);


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

if(app.get('env') === 'production') {
  // NOTE(jeff): Use Heroku's SSL back-end when available
  var server = app.listen(port, function() {
    var tcp_family = server.address().family;
    var tcp_addr = server.address().address;
    var tcp_port = server.address().port;
    console.log('Listening at TCP/IP %s: %s:%d', tcp_family, tcp_addr, tcp_port);
    console.log('Site environment: %s', app.get('env') );
    // console.log('Remote resource fetching: %s ', app.get('remote') );
  });
} else {
  // NOTE(jeff): Host a self-signed certificate SSL server
  var server = https.createServer(ssl_opts, app).listen(port, function() {
    var tcp_family = server.address().family;
    var tcp_addr = server.address().address;
    var tcp_port = server.address().port;
    console.log('Listening at TCP/IP %s: %s:%d', tcp_family, tcp_addr, tcp_port);
    console.log('Site environment: %s', app.get('env') );
    // console.log('Remote resource fetching: %s ', app.get('remote') );
  });
}
