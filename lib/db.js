var assert = require("assert");
var handle = require("mysql");

module.exports = {
  dbc: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "blew",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "IR_properties"
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
    return db_handle.escape(id);
  },

  format: function(query, inserts) {
    return db_handle.format(query, inserts);
  },

  find_property_by_job_num: function(job_number, callback) {
    var query = "SELECT * FROM `IR_properties` WHERE `JobNum` = ? ";

    // TODO(jeff): debug logs
    console.log("find_by_jobnum (QUERY):",query, "(", job_number, ")");

    this.query(query, job_number, callback);
  },

  find_property_by_job_id: function(job_id, callback) {
    var query = "SELECT * FROM IR_properties WHERE PropertyKey = ?";

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", query, "(", job_id, ")");

    this.query(query, job_id, callback);
  },

  find_all_properties: function(opts, callback) {
    assert(opts != null);
    assert(opts.order);
    assert(opts.sort);
    assert(opts.limit);

    var query = "SELECT * FROM IR_properties ORDER BY " + opts.order +
      " " + opts.sort + " " + "LIMIT " + opts.limit;

    // TODO(jeff): debug logs
    console.log("find_all (QUERY):", query);

    this.query(query, '', callback);
  },

  find_all_properties_by_status: function(id, callback) {
    var query = "SELECT * FROM IR_properties ";
    var pred = '';
    var values = '';

    if(id != null) {
      pred = 'WHERE `JobStatus` >= ? ';
      values = id;
    }

    query = query + pred;

    console.log("find_by_id (QUERY):", query, "(", values, ")");

    this.query(query, values, callback);
  }
}
