var assert = require("assert");
var library = require("mysql");
var app_utils = require('../lib/users/utils.js');
var Logger = require('../lib/Logger.js');

var default_config = {
  name: 'default',
  host: "127.0.0.1",
  user: 'Invalid user',
  password: 'Invalid password',
  database: 'Invalid database',
  table: "Invalid table",
};

// Default constructor
exports.MySQLDatabase = function(config) {
  this.connected_ = false;
  this.config_ = default_config;

  // TODO(jeff): Validate database options!
  var enumerable =
    app_utils.enumerate(config, 0) || app_utils.enumerate(config, 'host');

  if(enumerable === true) {
    this.config_ = config;
  }

  this.handle_ = library.createConnection(this.config_);
};

// Getters

exports.MySQLDatabase.prototype.valid = function() {
  return(this.connected_);
};

exports.MySQLDatabase.prototype.name = function() {
  return(this.config_.name);
};

exports.MySQLDatabase.prototype.database_name = function() {
  return(this.config_.database);
};

exports.MySQLDatabase.prototype.host_name = function() {
  return(this.config_.host);
};

// Setters

exports.MySQLDatabase.prototype.open = function() {
  var args = arguments;
  var argc = args.length;
  var user_callback = null;

  if(argc > 0) {
    assert(app_utils.function(args[0]) !== false,
           "The callback function argument must be a function pointer");

    user_callback = args[0];
  }

  var connection = this;

  if(this.connected_ === true) {
    var err = null;
    user_callback(err);

    return this.handle_;
  }

  this.handle_.connect( function(err) {

    if(err) {
      var status_code = err.errno || err.code || status_code;
      var err_message = err.address || err_message;

      Logger.err("BLEW_LOG_CATEGORY_APPLICATION",
                 "Failure to establish database connection to",
                 status_code, err_message);

      connection.connected_ = false;
    } else {
      Logger.info("BLEW_LOG_CATEGORY_APPLICATION",
                  "Established database connection to", connection.host_name() );

      connection.connected_ = true;
    }

    if(app_utils.null(user_callback) === false) {
      user_callback(err);
    }
  });

  // var host_name = this.handle_.host_name();
  // var host_name = '';
  // var testme = this.handle_;

  // this.handle_.ping( function(err) {
    // if(err) {
      // this.handle_.open();
      // testme.open();
      // this.testme(false);
    // } else {
      // this.testme(true);
      // Logger.info("BLEW_LOG_CATEGORY_APPLICATION",
                  // "Established database connection to", host_name);
  //   }
  // });

  // this.handle_ = library.createPool(this.config_);

  // this.handle_.getConnection( function(err, connection) {
  //   if(err) {
  //     console.log('pool err:', err);
  //   }
  //   connection.query('SELECT user_id FROM `Users`', function(err, rows) {
  //     if(err) {
  //       console.log('pool err:', err);
  //     } else {
  //       if(rows) {
  //         console.log(rows[0].user_id);
  //       }
  //     }
  //     connection.release();
  //   });
  // });

  return this.handle_;
};

exports.MySQLDatabase.prototype.close = function() {
  var host_name = this.host_name();

  this.handle_.end( function(err) {
    if(err) {
      Logger.warn("BLEW_LOG_CATEGORY_DATABASE",
                  "Failure to terminate database connection to",
                  host_name);
    } else {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE",
                  "Terminating database connection to", host_name);
    }
  });

  // Free up memory
  delete this.handle_;
  this.handle_ = null;

  this.connected_ = false;
};

exports.MySQLDatabase.prototype.config = function() {
  var cfg = this.config_;
  var args = arguments;

  // Optional function argument
  var key = args[1];

  // Default return value
  var result = false;

  // One or more arguments has been given to this function; let's try doing a
  // lookup on the configuration object, using the argument as a string index.
  if(app_utils.string(key) === true) {

    if(app_utils.has(cfg, key) === true) {
      result = cfg.get(key);
    }
  }

  return(result);
};

exports.MySQLDatabase.prototype.query =
function(search_query, search_values, callback) {
  var args = {
    query: search_query,
    values: '',
    delegate: callback
  };

  if(arguments.length == 3) {
    args.values = search_values;
  } else if(arguments.length == 2) {
    args.delegate = search_values;
  }

  assert(app_utils.function(args.delegate) !== false,
         "The callback function argument must be a function pointer");

  var query = {
    sql: args.query,
    values: args.values,
    timeout: app_utils.seconds(10),
  };

  this.handle_.query(query, function(err, rows, fields) {
    var error = {};
    if(err) {
      error.code = err.errno || err.code || 400;
      // error.message = err || 'Invalid request';
      error.message = 'Invalid request';
      error.data = err.data || null;

      if(err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
        error.message = 'timed out';
      } else if(err.errno === 'ECONNREFUSED') {
        error.message = 'Could not establish a database connection';
        if(err.address) {
          error.message =
            'Could not establish a database connection to ' + err.address;
        }
      }

    } else {
      error = null;
      if(app_utils.null_or_undefined(rows) === true) {
        rows = {};
      }

      if(app_utils.null_or_undefined(fields) === true) {
        fields = {};
      }
    }

    args.delegate(error, rows, fields);
  });
};

exports.MySQLDatabase.prototype.escape = function(id) {
  var result = this.handle_.escape(id);
  return(result);
};

exports.MySQLDatabase.prototype.escapeId = function(id) {
  var result = this.handle_.escapeId(id);
  return(result);
};

exports.MySQLDatabase.prototype.format = function(query, inserts) {
  return this.handle_.format(query, inserts);
};

module.exports = exports.MySQLDatabase;
