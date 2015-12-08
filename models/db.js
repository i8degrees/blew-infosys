var express = require('express');
var app = express();

var util = require('util');
var assert = require("assert");
var handle = require("mysql");
var utils = require('../lib/users/utils');
var Logger = require('../lib/Logger.js');
var Err = require('../lib/Err.js');

// TODO(jeff): Consolidate find_job_* methods
module.exports = {

  dbc: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "blew",
    // user: "bflew",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "IR_properties",
    // table: process.env.MYSQL_TABLE || "IR_properties",
    multipleStatements: false,
  },

  db_handle: null,
  connected_: false,

  // The current error state; only the latest err state is stored
  err_: null,

  valid: function() {
    return(this.connected_);
  },

  host_name: function() {
    return(this.dbc.host);
  },

  user_name: function() {
    return(this.dbc.user);
  },

  user_password: function() {
    return(this.dbc.password);
  },

  database_name: function() {
    return(this.dbc.database);
  },

  create_connection: function() {
    // var error = new Err();
    var error = null;
    // var error = this.err_;
    // var error = new AppError.Err.initialize()
    this.err_ = error;
    // this.err_ = new AppError.Err();
    // console.log(this.err_);
    // this.err_.set_message('eek');
    // console.log(this.err_.err());

    this.connected_ = true;

    this.db_handle = handle.createConnection(this.dbc);

    this.db_handle.connect( function(err) {
      // this.err_ = new AppError.Err({ code: 401, message: 'f'});
      var status_code = 200; // HTTP OK

      if(err) {
        // error.set_error(400, 'f');
        // console.log('error:', error);
        // this.err_.set_error(400, 'f');

        // console.log('err_:', this.err_);
        // this.err_.set_error(400, 'f');

        // this.err_ = { code: 400, message: 'fuck' };

        Logger.err("BLEW_LOG_CATEGORY_APPLICATION",
                   "Failure to establish database connection:",
                   error.status(), error.message() );
      } else {
        this.connected_ = true;
      }
    });

    Logger.info("BLEW_LOG_CATEGORY_APPLICATION",
                "Established connection to:",
                this.database_name(), "at", this.host_name() );

    // return db_handle;
  },

  close_connection: function() {

    if(this.valid() === true) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE",
                  "Terminating database connection to", this.host_name());

      this.db_handle.end();

      // Clean up err state
      delete this.err_;
      delete this.db_handle;
      this.err_ = null;
      this.db_handle = null;
      this.connected_ = false;
    } else {
      Logger.warn("BLEW_LOG_CATEGORY_DATABASE",
                  "Failure to terminate database connection to",
                  this.host_name());
    }
  },

  query: function(search_query, search_values, callback) {
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

    if(util.isFunction(args.delegate) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback,
                 " must be a function pointer");
      return;
    }

    var query = {
      sql: args.query,
      values: args.values,
      timeout: 5000, // 5s
    };

    if(this.valid() === true) {
      this.db_handle.query(query, function(err, rows, fields) {
        if(err) {
          //
        }
        // args.delegate(this.err_, rows, fields);
        args.delegate(err, rows, fields);
      });
    } else {
      // var err = { code: 400, message: 'Database not connected' };
      // var err = this.err_.err();
      var err = err;
      var rows = {};
      var fields = {};
      args.delegate(err, rows, fields);
    }
  },

  escape: function(id) {
    var result = this.db_handle.escape(id);
    return(result);
  },

  escapeId: function(id) {
    var result = this.db_handle.escapeId(id);
    return(result);
  },

  format: function(query, inserts) {
    return this.db_handle.format(query, inserts);
  },

  find_property_by_job_num: function(job_number, callback) {
    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    var query = "SELECT * FROM `IR_properties` WHERE `JobNum` = ? ";

    if(app.get('env') === 'development') {
      console.log("find_by_jobnum (QUERY):",query, "(", job_number, ")");
    }

    this.query(query, job_number, callback);
  },

  find_property_by_job_id: function(job_id, callback) {
    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    var query = "SELECT * FROM IR_properties WHERE PropertyKey = ?";

    if(app.get('env') === 'development') {
      console.log("find_by_id (QUERY):", query, "(", job_id, ")");
    }

    this.query(query, job_id, callback);
  },

  find_jobs: function(params, callback) {
    // var table = this.database_name();
    var table = 'IR_properties';
    var pre_values = {};
    var values = [];
    var pre_update_col = '';

    assert(util.isNullOrUndefined(params) === false);

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    if(util.isNullOrUndefined(params.order) === true) {
      params.order = 'DateEdited';
      values.push(params.order);
    }

    if(util.isNullOrUndefined(params.sort) === true) {
      params.sort = 'DESC';
      values.push(params.sort);
    }

    if(util.isNullOrUndefined(params.limit) === true) {
      params.limit = 10;
    } else {
      params.limit = params.limit;
    }
    values.push(Number(params.limit));

    if(util.isNullOrUndefined(params.jobnum) === false) {
      pre_values.JobNum = params.jobnum;
      pre_update_col = 'JobNum';
    }

    if(util.isNullOrUndefined(params.pid) === false) {
      pre_values.PropertyKey = params.pid;
      pre_update_col = 'PropertyKey';
    }

    if(util.isNullOrUndefined(params.status) === false) {
      pre_values.JobStatus = params.status;
      pre_update_col = 'JobStatus';
    }

    var query = "SELECT * FROM ?? ";
    query = this.format(query, table);

    if(pre_values.propertyIsEnumerable(pre_update_col) === true) {
      query += this.format("WHERE ? ", pre_values);
    }

    query += this.format(" ORDER BY ? ? LIMIT ?", values);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "find_jobs:", query);
    }

    this.query(query, callback);
  },

  find_job_by_status: function(id, callback) {
    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    var query = "SELECT * FROM `IR_properties` WHERE JobStatus = " +
      this.escape(id);

    if(app.get('env') === 'development') {
      console.log("find_job_by_status (QUERY):", query);
    }
    this.query(query, id, callback);
  },

  remove_job: function(job_id, callback) {

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    // FIXME(jeff):
    // assert(job_id != null, "Removing a job requires a job ID");

    if(job_id === null) {
      var missing_param = this.err_.err_err_ecode[-32602];
      var missing_param_str = this.err_.err_ecode[-32602].msg;
      this.err_.set_error(missing_param, missing_param_str);

      var result = null;
      var fields = null;
      return callback(this.err_.err(), result, fields);
    }

    var query = 'DELETE FROM `IR_properties` WHERE PropertyKey = ? LIMIT 1';

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "remove_job:", query);
    }

    this.query(query, job_id, callback);
  },

  add_user: function(params, callback) {
    var user_ip = '127.0.0.1';

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    assert(params !== null, "::add_user requires passing an options JSON object");
    assert(params.user_id, "::add_user requires a user ID string");
    // TODO(jeff): Rename to user_password
    assert(params.password, "::add_user requires a user password");

    var password_hash = utils.generate_hash(params.password);

    if(params.user_ip) {
      user_ip = params.user_ip;
    }

    var query = 'INSERT INTO `users` SET user_id = ?, ' +
      'user_password = ?, date_created = NOW(), ' +
      'date_edited = NOW(), user_ip = HEX(INET6_ATON(?))';

    // TODO(jeff): validation of fields
    var values = [ params.user_id, password_hash, user_ip ];
    query = handle.format(query, values);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "create_user:", query);
    }

    this.query(query, values, callback);
  },

  update_user: function(params, callback) {
    assert(params !== null,
           "::update_user requires passing an options JSON object");
    // assert(params.user_id, "::update_user requires a user ID string");
    // assert(params.password, "::update_user requires a user password");

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    var values = {};

    if(params.user_id) {
      values.user_id = params.user_id;
    }

    if(params.user_password) {
      var password_hash = utils.generate_hash(params.user_password);

      values.user_password = password_hash;
    }

    if(params.last_login) {
      values.date_edited = params.last_login;
    }

    // FIXME
    if(params.user_ip) {
      // var q = 'HEX(INET6_ATON(?))';
      // var v = [ params.ip ];
      // q = this.format(q, v);
      // values.user_ip = q;

      // var v = 'HEX(INET6_ATON('+params.ip+'))';
      // var v = params.ip;
      // values.user_ip = v;

      values.user_ip = params.user_ip;
    }

    // var query = 'INSERT INTO `users` SET user_id = ?, ' +
    //   'user_password = PASSWORD(?), date_created = NOW(), ' +
    //   'date_edited = NOW(), user_ip = HEX(INET6_ATON(?))';

    // TODO(jeff): validation of fields

    // TODO(jeff): Add LIMIT clause to the end of this query
    var query = 'UPDATE `users` SET ? WHERE user_id = ?';
    query = this.format(query, [values, params.user_id]);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "update_user:", query);
    }

    this.query(query, callback);
  },

  find_user: function(params, callback) {
    assert(params !== null, "::find_user requires passing an options JSON object");
    assert(params.order);
    assert(params.sort);
    assert(params.limit);

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    if(util.isNullOrUndefined(params.order) === true) {
      params.order = 'user_id';
    }

    if(util.isNullOrUndefined(params.sort) === true) {
      params.sort = 'ASC';
    }

    if(util.isNullOrUndefined(params.limit) === true) {
      params.limit = 1;
    }

    // NOTE(jeff): String to integer
    params.limit = Number(params.limit);

    // NOTE(jeff): Adds additional field onto the end of results, addressable
    // as "INET6_NTOA(user_ip)"
    var query = 'SELECT *, INET6_NTOA(UNHEX(user_ip)) FROM users ';
    if(params.user_id) {
      query += this.format('WHERE user_id = ? ', params.user_id);
    }

    var values = [ params.order, params.sort, params.limit ];
    query += this.format('ORDER BY ? ? LIMIT ?', values);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "find_user:", query);
    }

    this.query(query, callback);
  },

  remove_user: function(params, callback) {
    assert(params !== null,
           "A params object that is not NULL is required");
    assert(params.user_id,
           "Removing a user requires passing of a params object with a user_id key and string value");

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback +
                 " must be a function pointer");
      return;
    }

    if(util.isNullOrUndefined(params.limit) === true) {
      params.limit = 1;
    }

    var query = 'DELETE FROM `users` WHERE user_id = ? LIMIT ?';
    var values = [ params.user_id, params.limit ];
    query = handle.format(query, values);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "remove_user:", query);
    }

    this.query(query, callback);
  },

  search_jobs: function(params, callback) {
    var values = [];

    assert(params !== null,
           "This function requires passing an options JSON object");
    assert(params.query !== null,
           "This function requires a search query string");

    if(util.isFunction(callback) === false) {
      Logger.err("BLEW_LOG_CATEGORY_APPLICATION", callback,
                 " must be a function pointer");
      return;
    }

    var qstr = params.query;
    qstr = qstr.replace("+", " AND ");
    qstr = qstr.replace("-", " NOT ");
    values.push(qstr);

    if(util.isNullOrUndefined(params.limit) === false) {
      values.push( Number(params.limit) );
    }

    var query = "SELECT * FROM `IR_properties` WHERE MATCH" +
      "(JobNum, JobContact, JobNotes, JobAddress) " + "AGAINST(? IN BOOLEAN MODE) LIMIT ?;";
    query = this.format(query, values);

    if(utils.env() === 'development' && this.valid()) {
      Logger.info("BLEW_LOG_CATEGORY_DATABASE",
                  "parsed search query terms:", qstr);

      Logger.info("BLEW_LOG_CATEGORY_DATABASE", "search_jobs:", query);
    }

    this.query(query, callback);
  },
};
