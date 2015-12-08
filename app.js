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
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var flash = require('connect-flash');

var app_utils = require('./lib/users/utils.js');
var Err = require('./lib/Err.js');

var index = require('./routes/index');
var contacts_api = require('./routes/contacts');
var jobs = require('./routes/jobs');
var jobs_api = require('./routes/api');
var users_api = require('./routes/users');
var status = require('./routes/status');

var cors = require('cors');
var get_ip = require('ipware')().get_ip;

var app = express();

// https://web.archive.org/web/20150815205449/http://greengeckodesign.com/blog/2013/06/15/creating-an-ssl-certificate-for-node-dot-js/
var ssl_opts = {};
if(app.get('env') === 'production') {
  // NOTE(jeff): Use Heroku's SSL back-end when available
  app.use( enforce_ssl.HTTPS( { trustProtoHeader: true }) );
} else {
  // NOTE(jeff): Host a self-signed certificate SSL server
  // ssl_opts = {
  //   key: fs.readFileSync('./keys/server.key'),
  //   cert: fs.readFileSync('./keys/server.crt'),
  //   ca: fs.readFileSync('./keys/ca.crt'),
  //   requestCert: true,
  //   rejectUnauthorized: false,
  // };
}

var verify_request_body = function(req, res, buf, encoding) {
  // ...
};

var request_body_opts = {
  // Allows rich encoding of objects and arrays, i.e.: JSON
  extended: true,
  // Maximum request body size of 64KB
  // limit: 65536,
  // Compressed request bodies shall be deflated, not ignored
  // inflate: true,

  // TODO(jeff): Implement validation checking of the request body data;
  // parsing can be aborted if we find anything suspicious!
  // verify: verify_request_body
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(request_body_opts));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize persistent data store -- user sessions and cookies
//
// NOTE(jeff): Accessible through the route's req.session variable.
//
// https://github.com/expressjs/session
// https://github.com/chill117/express-mysql-session

var session_secret = '';
if(process.env.SESSION_SECRET !== null) {
  // Use environment variable set in one of the .env site files
  session_secret = process.env.SESSION_SECRET;
} else {
  // Default value for when the environment variable is **not** set
  session_secret = 'not a secure session secret!!!';
  console.warn("app [WARN]: SESSION_SECRET environment variable is not set; using insecure default!");
}

// TODO(jeff): Implement signed cookies!
var secure_cookies = false;
if(app.get('env') === 'production') {
  app.set('trust proxy', 1);  // trust first proxy
  secure_cookies = true;
}

var db_params = {
  host:process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "blew",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "IR",
  // table: process.env.MYSQL_TABLE || "sessions",

  // NOTE(jeff): Automatically create the session database table, if one does
  // not exist
  createDatabaseTable: false,
  schema: {
    tableName: 'sessions',
    columnNames: {
        session_id: 'session_id',
        expires: 'session_expiration',
        data: 'session_data'
    }
  },

  // How frequently expired sessions will be cleared; milliseconds.
  checkExpirationInterval: 120000, // 120s

  // The maximum age of a valid session; milliseconds.
  expiration: 86400000, // 24h

  // Whether or not to re-establish a database connection after a disconnect.
  autoReconnect: true,
};

app.use( session({
  store: new SessionStore(db_params),
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

  key: 'sid',
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
  };

  res.locals.query = '';

  next();
});

// IMPORTANT(jeff): Enable COR; Cross-Origin Request
// https://www.npmjs.com/package/cors
app.use( cors() );

var api_version = {
  "version": 1,
  "path": "/api/v1"
};

app.use('/', index);
app.use('/jobs', jobs);
app.use('/status', status);
app.use('/users', users_api);
app.use(api_version.path, jobs_api);

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  err.message = 'Not found';

  return next(err);
});

app.use(function(err, req, res, next) {

  var dev_env = app_utils.env();

  // NOTE(jeff): Try to pass the err down the stack to see if anybody wants to
  // deal with it
  var url_path = req.path;

  var err_obj = {};
  if(err) {
    err_obj = err;
  }

  if(dev_env === 'testing' || dev_env === 'production') {
    // IMPORTANT(jeff): Do not leak detailed error reporting, i.e.: stack
    // traces, to the end-user
    delete err_obj.stack;
  } else {
    err_obj.stack = err.stack;
  }

  if(res.headersSent) {
    // NOTE(jeff): HTTP request has already been responded to -- we must
    // continue onwards!
    return next(err_obj);
  }

  if(url_path.includes('/api') === true) {
    // NOTE(jeff): Let a specialized error handler deal with web service API
    // problems
    return next(err_obj);
  }

  res.render('error', { error: err_obj } );
});

// http://www.jsonrpc.org/specification
//
// TODO(jeff): Change all instances of err.status to err.code and add the
// string key, 'stack', to the global err object.
app.use( function(err, req, res, next) {

  // var error = new Err();

  var response = {
    jsonrpc: "2.0"
  };

  // NOTE(jeff): This is a special needs route; our web service API **must**
  // respond with well-formed JSON encoded objects with the response header
  // of Content-Type: 'application/json'.
  if(res.headersSent) {
    return next(err);
  }

  var status_code = 400;

  if(err) {
    response.error = {};
  }

  if(err.code) {
    status_code = err.code;
  }

  response.error.code = status_code;

  if(err.message) {
    response.error.message = err.message;
  } else {
    // response.error.message = error.ecode(400);
    response.error.message = Err.get(Err, 400);
  }

  res.writeHead(status_code, {'Content-Type': 'application/json'} );
  res.write(JSON.stringify(response));
  res.end();
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

// NOTE(jeff): Default configuration for the serving host
var server_config = {
  // IP address or DNS host name
  ip: '127.0.0.1',

  // Ports lower than 1024 require root privileges
  port: 3000,

  // The number of milliseconds that we wait before marking the connection as
  // timed out -- an error state.
  timeout: app_utils.seconds(60),

  // dbc: [{
  //   name: 'default',
  //   host: process.env.MYSQL_HOST || "localhost",
  //   user: process.env.MYSQL_USER || "blew",
  //   password: process.env.MYSQL_PASSWORD || "Invalid password",
  //   database: process.env.MYSQL_DATABASE || "IR_properties",
  //   table: "IR_properties",
  //   multipleStatements: false,
  // },
  // {
  //   name: 'err',
  //   host: 'localhost',
  //   user: "bflew",
  //   password: 'pass',
  //   database: 'IR',
  //   table: 'IR_properties',
  //   multipleStatements: false,
  // }],
  pool: null,
};

if(process.env.APP_HOST) {
  server_config.ip = String(process.env.APP_HOST);
}

if(process.env.PORT) {
  server_config.port = Number(process.env.PORT);
} else if(process.env.APP_PORT) {
  server_config.port = Number(process.env.APP_PORT);
}

if(process.env.RESPONSE_TIMEOUT) {
  server_config.timeout = Number(process.env.RESPONSE_TIMEOUT);
}

var DBC = require('./models/DatabaseConfig.js');
var MySQLDatabase = require('./models/MySQLDatabase.js');
var DatabasePool = require('./lib/DatabasePool.js');
var db = new MySQLDatabase(DBC[0]);
server_config.pool = new DatabasePool(db);

// Store the server configuration as an object that is accessible app-wide
app.set('server_config', server_config);

module.exports = app;
