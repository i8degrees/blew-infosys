var assert = require("assert");
var handle = require("mysql");

module.exports = {
  dbc: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "blew",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "IR_properties",
    migrate: "safe"
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
    db_handle.destroy();
  },

  query: function(search_query, search_values, callback) {

    db_handle.query({ sql: search_query, values: search_values}, function(err, rows, fields) {
      callback(err, rows, fields);
    });

  },

  escape: function(id) {
    return db_handle.escape(id);
  },

  format: function(query, inserts) {
    return db_handle.format(query, inserts);
  },

  find_property_by_job_num: function(id, callback) {
    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    // var search_query = "SELECT `PropertyKey` FROM IR_properties ";
    var search_query = "SELECT * FROM IR_properties ";

    // NOTE(jeff): The default search match pair
    var search_match = 'WHERE `JobNum` = ? ';

    // NOTE(jeff): Search variable to match
    var search_values = id;

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_property_by_job_id: function(id, callback) {
    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    // var search_query = "SELECT `PropertyKey` FROM IR_properties ";
    var search_query = "SELECT * FROM IR_properties ";

    // NOTE(jeff): The default search match pair
    var search_match = 'WHERE `PropertyKey` = ?';

    // NOTE(jeff): Search variable to match
    var search_values = id;

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_all_properties: function(opts, callback) {

    assert(opts != null);
    assert(opts.order);
    assert(opts.sort);
    assert(opts.limit);

    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    var search_query = "SELECT * FROM IR_properties ORDER BY " + opts.order +
      " " + opts.sort + " " + "LIMIT " + opts.limit;

    // NOTE(jeff): The default search match pair
    var search_match = '';

    // NOTE(jeff): Search variable to match
    var search_values = '';

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_all_properties_by_status: function(id, callback) {
    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    var search_query = "SELECT * FROM IR_properties ";

    // NOTE(jeff): The default search match pair
    var search_match = '';

    // NOTE(jeff): Search variable to match
    var search_values = '';

    if(id != null) {
      search_match = 'WHERE `JobStatus` >= ? ';
      search_values = id;
    }

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_all_contacts: function(opts, callback) {
    assert(opts != null);
    assert(opts.order);
    assert(opts.sort);
    assert(opts.limit);

    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    var search_query = "SELECT * FROM IR_contacts ORDER BY " + opts.order +
      " " + opts.sort + " " + "LIMIT " + opts.limit;

    // NOTE(jeff): The default search match pair
    var search_match = '';

    // NOTE(jeff): Search variable to match
    var search_values = '';

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_contact_by_id: function(id, callback) {
    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    var search_query = "SELECT * FROM IR_contacts ";

    // NOTE(jeff): The default search match pair
    var search_match = 'WHERE `ClientKey` = ? ';

    // NOTE(jeff): Search variable to match
    var search_values = id;

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  },

  find_contact_by_name: function(id, callback) {
    // NOTE(jeff): Initialize our database link
    var dbi = this.create_connection();

    // NOTE(jeff): Prepare SQL code for grabbing data
    var search_query = "SELECT * FROM IR_contacts ";

    // NOTE(jeff): The default search match pair
    var search_match = 'WHERE `Contact` LIKE ? ';
    // var search_match = 'WHERE `Contact` = ? ';

    // NOTE(jeff): Search variable to match
    // var search_values = id;
    // FIXME:
    var search_values = "%" + id + "%";

    search_query = search_query + search_match;

    // TODO(jeff): debug logs
    console.log("find_by_id (QUERY):", search_query, "(", search_values, ")");

    this.query(search_query, search_values, callback);
  }
}
