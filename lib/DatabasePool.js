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
exports.DatabasePool = function(db_handle) {
  this.handles_ = [];
  this.config_ = default_config;

  var config = null;
  if(app_utils.null_or_undefined(db_handle) === false) {
    config = db_handle.config_;
  }

  // TODO(jeff): Validate database options!
  var enumerable =
    app_utils.enumerate(config, 0) || app_utils.enumerate(config, 'host');

  if(enumerable === true) {
    this.config_ = config;
  }

  var connection = {};
  connection.available = true;
  if(app_utils.null_or_undefined(db_handle) === true) {
    connection.handle = library.createConnection(this.config_);
    this.handles_.push(connection.handle);
  } else {
    connection.handle = db_handle;
    this.handles_.push(connection.handle);
  }
};

exports.DatabasePool.prototype.release = function() {

};

exports.DatabasePool.prototype.connection = function(callback) {
  var num_connections = this.handles_.length;

  if(num_connections > 0) {
    for(var idx = 0; idx != num_connections; ++idx) {
      var connection = this.handles_[idx];

      if(connection.available == true) {
        // connection.open( function(err) {
        //   if(err) {
        //     Logger.err("BLEW_LOG_CATEGORY_DATABASE", err);
        //     return;
        //   }

          return connection;
        // });
      }
    }
  } else {
    //
  }
};

module.exports = exports.DatabasePool;
