var express = require('express');
var app = express();

var assert = require("assert");
var handle = require("mysql");

// TODO(jeff): Consolidate find_job_* methods
module.exports = {
  dbc: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "blew",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "IR_properties",
    // table: process.env.MYSQL_TABLE || "IR_properties"
  },

  db_handle: null,

  create_connection: function() {
    db_handle = handle.createConnection(this.dbc);

    db_handle.connect( function(err) {
      if(err) {
        console.log("ERR: Failed to connect to IR database; ", err);
      } else {
        console.log("INFO: Connected to IR database");
      }
    });

    // return db_handle;
  },

  close_connection: function() {
    db_handle.end();
  },

  query: function(search_query, search_values, callback) {
    db_handle.query({ "sql": search_query, "values": search_values},
                    function(err, rows, fields) {
                      callback(err, rows, fields);
    });

  },

  escape: function(id) {
    var result = db_handle.escape(id);
    return(result);
  },

  escapeId: function(id) {
    var result = db_handle.escapeId(id);
    return(result);
  },

  format: function(query, inserts) {
    return db_handle.format(query, inserts);
  },

  find_property_by_job_num: function(job_number, callback) {
    var query = "SELECT * FROM `IR_properties` WHERE `JobNum` = ? ";

    if(app.get('env') === 'development') {
      console.log("find_by_jobnum (QUERY):",query, "(", job_number, ")");
    }

    this.query(query, job_number, callback);
  },

  find_property_by_job_id: function(job_id, callback) {
    var query = "SELECT * FROM IR_properties WHERE PropertyKey = ?";

    if(app.get('env') === 'development') {
      console.log("find_by_id (QUERY):", query, "(", job_id, ")");
    }

    this.query(query, job_id, callback);
  },

  find_all_jobs: function(opts, callback) {
    assert(opts != null);
    assert(opts.order);
    assert(opts.sort);
    assert(opts.limit);

    // TODO:
    // if(opts.status) {
      // fields.push('JobStatus');
      // values.push(opts.status);
    // }

    var query = "SELECT * FROM IR_properties ORDER BY " + opts.order +
      " " + opts.sort + " " + "LIMIT " + opts.limit;

    if(app.get('env') === 'development') {
      console.log("find_all_jobs (QUERY):", query);
    }

    this.query(query, '', callback);
  },

  find_job_by_status: function(id, callback) {
    var query = "SELECT * FROM `IR_properties` WHERE JobStatus = " +
      this.escape(id);

    if(app.get('env') === 'development') {
      console.log("find_job_by_status (QUERY):", query);
    }
    this.query(query, id, callback);
  },

  find_user: function(opts, callback) {
    assert(opts != null);
    assert(opts.order);
    assert(opts.sort);
    assert(opts.limit);

    // NOTE(jeff): Adds additional field onto the end of results, addressable
    // as "INET_NTOA(user_ip)"
    var query = 'SELECT *, INET_NTOA(user_ip) FROM users ';
    if(opts.uid) {
      query += this.format('WHERE user_id = ? ', opts.uid);
    }

    var values = [ opts.order, opts.sort, opts.limit ];
    query += this.format('ORDER BY ? ? LIMIT ?', values);

    if(app.get('env') === 'development') {
      console.log("find_user (QUERY):", query);
    }

    this.query(query, '', callback);
  },
}
