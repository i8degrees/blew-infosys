var assert = require("assert");
var app_utils = require('../lib/users/utils');
var Logger = require('../lib/Logger.js');
var AppError = require('../lib/Err.js');

exports.Jobs = function(db_handle) {
  var argc = arguments.length;

  if(argc < 1) {
    this.handle_ = null;
  } else {
    this.handle_ = db_handle;
  }

  this.table_ = 'IR_properties';

  if(app_utils.null_or_undefined(this.handle_) === true) {
    Logger.err("BLEW_LOG_CATEGORY_APPLICATION", this.handle_,
               "A valid database handle must be passed at time of creating the",
               "object instance!");
  }

  // IMPORTANT(jeff): this.handle_.connected_ should be false until a call to
  // db_handle.open is made.
};

exports.Jobs.prototype.find = function(params, callback) {

  var where_value = {};
  var values = [];

  if(app_utils.object(params) === false) {
    params = {};
  }

  if(app_utils.has(params, 'query') === true) {
    return this.search(params, callback);
  }

  if(app_utils.has(params, 'order') === false) {
    params.order = 'DateEdited';
  }

  if(app_utils.has(params, 'sort') === false) {
    params.sort = 'DESC';
  }

  if(app_utils.has(params, 'limit') === false) {
    params.limit = 25;
  } else {
    params.limit = Number(params.limit);
  }

  values.push(params.order);
  values.push(params.sort);
  values.push(params.limit);

  if(app_utils.has(params, 'pid') === true) {
    where_value.PropertyKey = params.pid;
  } else if(app_utils.has(params, 'jobnum') === true) {
    where_value.JobNum = params.jobnum;
  } else if(app_utils.has(params, 'status') === true) {
    where_value.JobStatus = params.status;
  }

  var query = "SELECT * FROM ?? ";
  query = this.handle_.format(query, this.table_);

  if(Object.keys(where_value).length > 0) {
    query += this.handle_.format("WHERE ? ", where_value);
  }

  query += this.handle_.format("ORDER BY ? ? LIMIT ? ", values);

  if(app_utils.env() === 'development') {
    Logger.trace("BLEW_LOG_CATEGORY_DATABASE");
    Logger.info("BLEW_LOG_CATEGORY_DATABASE", "find_jobs:", query);
  }

  this.handle_.query(query, callback);
};

exports.Jobs.prototype.search = function(params, callback) {
  var values = [];
  var err = {};

  if(app_utils.object(params) === false) {
    params = {};
  }

  if(app_utils.has(params, 'limit') === false) {
    params.limit = 50;
  } else {
    params.limit = Number(params.limit);
  }

  if(app_utils.has(params, 'query') === false) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Missing query key in params object'
    };

    return callback(err);
  }

  var qstr = params.query;
  qstr = qstr.replace("+", " AND ");
  qstr = qstr.replace("-", " NOT ");

  values.push(this.table_);
  values.push(qstr);
  values.push(params.limit);

  var query = "SELECT * FROM ?? WHERE MATCH" +
    "(JobNum, JobContact, JobNotes, JobAddress) " +
    "AGAINST(? IN BOOLEAN MODE) LIMIT ?;";

  query = this.handle_.format(query, values);

  if(app_utils.env() === 'development') {
    Logger.info("BLEW_LOG_CATEGORY_DATABASE",
                "parsed search query terms:", qstr);

    Logger.info("BLEW_LOG_CATEGORY_DATABASE", "search_jobs:", query);
  }

  this.handle_.query(query, callback);
};

exports.Jobs.prototype.create = function(params, callback) {
  var values = [];
  var err = {};

  if(app_utils.object(params) === false) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Params object must be a JSON object'
    };

    return callback(err);
  }

  if(params.length < 1) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Params object is empty'
    };

  // if(app_utils.has(params,

    return callback(err);
  }

  // if(app_utils.has(params, 'job_id') === false) {
  //   err = {
  //     code: -32602,
  //     message: 'Invalid method parameters',
  //     data: 'Missing job_id key in params object'
  //   };

  //   return callback(err);
  // }

  // values.push(params.job_id);

  // if(app_utils.has(params, 'limit') === false) {
  //   params.limit = 1;
  // } else {
  //   params.limit = Number(params.limit);
  // }

  // values.push(params.limit);

  // var query = 'DELETE FROM `IR_properties` WHERE PropertyKey = ? LIMIT ?';
  // query = this.handle_.format(query, values);

  // if(app_utils.env() === 'development') {
  //   Logger.info("BLEW_LOG_CATEGORY_DATABASE", "remove_job:", query);
  // }

  // this.handle_.query(query, callback);
};

exports.Jobs.prototype.update = function(params, callback) {
  var table = 'IR_properties';
  var values = {};

  // TODO(jeff): validation of fields
  if(params.pid) {

    values.PropertyKey = params.pid;

    if(params.jobnum) {
      values.JobNum = handle.escape(params.jobnum);
    }

    if(params.notes) {
      values.JobNotes = handle.escape(params.notes);
    }

    if(params.due_date) {
      values.JobDateNeeded = handle.escape(params.due_date);
    }

    if(params.status) {
      values.JobStatus = handle.escape(params.status);
    }

    if(params.contact) {
      values.JobContact = handle.escape(params.contact);
    }

    if(params.email) {
      values.JobEmail = handle.escape(params.email);
    }

    if(params.addr) {
      values.JobAddress = handle.escape(params.addr);
    }

    if(values.length > 0) {
      values.DateEdited = 'NOW()';
    }

    var query = 'UPDATE ?? SET ? WHERE PropertyKey = ?';
    query = this.handle_.format(query, [table, values, params.pid]);

    Logger.debug("BLEW_LOG_CATEGORY_DATABASE", query);

    this.handle_.query(query, callback);
  }
};

exports.Jobs.prototype.remove = function(params, callback) {
  var values = [];
  var err = {};

  if(app_utils.object(params) === false) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Params object must be a JSON object'
    };

    return callback(err);
  }

  if(params.length < 1) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Params object is empty'
    };

    return callback(err);
  }

  if(app_utils.has(params, 'job_id') === false) {
    err = {
      code: -32602,
      message: 'Invalid method parameters',
      data: 'Missing job_id key in params object'
    };

    return callback(err);
  }

  values.push(params.job_id);

  if(app_utils.has(params, 'limit') === false) {
    params.limit = 1;
  } else {
    params.limit = Number(params.limit);
  }

  values.push(params.limit);

  var query = 'DELETE FROM `IR_properties` WHERE PropertyKey = ? LIMIT ?';
  query = this.handle_.format(query, values);

  if(app_utils.env() === 'development') {
    Logger.info("BLEW_LOG_CATEGORY_DATABASE", "remove_job:", query);
  }

  this.handle_.query(query, callback);
};

module.exports = exports.Jobs;
