// JSON RPC library
var rpc = require('rpc.js');

var assert = require("assert");
var handle = require("../models/db.js");

// rpc.server('http', {
//   port: process.env.RPC_PORT || 8000,
//   address: process.env.RPC_HOST || "localhost",

//   // NOTE(jeff): API Schema for our HTTP-RPC server
//   gateway: rpc.gateway({
//     schema: require('./lib/api.js')
//   })
// });

// static
var create_update_query = function(db, fields, values) {
  var query = new String('');
  var pair_size = fields.length;

  assert(pair_size == values.length);

  for(var idx = 0; idx != pair_size; ++idx) {

    if(idx == 0) {
      query += 'SET ';
    }

    if(idx != (pair_size-1) ) {
      query += fields[idx] + ' = ' + db.escape(values[idx]) + ",";
    } else {
      query += fields[idx] + ' = ' + db.escape([idx]);
    }
  }

  return query;
};

// JSON RPC API schema
// TODO(jeff): documentation!
module.exports = {

  // API methods
  methods: {
    list_pr: {
      params: {
        pid: { required: false, type: 'number', info: 'ID of the property' },
        jobnum: { required: false, type: 'number', info: 'Drawing number'},
        status: { required: false, type: 'number', info: 'status of job' },
        order: { required: false, type: 'string', info: 'Column to sort results by'},
        sort: { required: false, type: 'string', info: 'Ascending or descending order by'},
        limit: { required: false, type: 'number', info: 'Maximum number of results'}
      },

      action: function(params, output) {

        handle.create_connection();

        if(params.order == null) {
          params.order = "DateEdited";
        }

        if(params.sort == null) {
          params.sort = "DESC";
        }

        // TODO(jeff): Impose minimum and maximum limits here!
        // TODO(jefff): Implement pagination!
        if(params.limit == null) {
          params.limit = 50;
        }

        var opts = {
          order: params.order,
          sort: params.sort,
          limit: params.limit
        };

        if(params.pid) {
          handle.find_property_by_job_id(params.pid, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            output.win(result);
          });
        }

        if(params.jobnum) {
          console.log("jobnum != null");

          handle.find_property_by_job_num(params.jobnum, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            output.win(result);
          });
        }

        if(params.status) {
          handle.find_job_by_status(params.status, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            if( result == null  ) {
              output.fail('Invalid Request');
            } else {
              output.win(result);
            }
          });
        }

        // NOTE(jeff): Catch-all case
        if(params.status == null) {
          handle.find_all_jobs(opts, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            if( result == null  ) {
              output.fail('Invalid Request');
            } else {
              output.win(result);
            }
          });
        }

       handle.close_connection();
      }
    },

    create_job: {
      params: {
        jobnum: { required: true, type: 'string', info: 'Drawing number'},
        client: { required: true, type: 'string', info: 'Client name'},
        address: { required: false, type: 'string', info: 'Postal address'},
        status: { required: false, type: 'number', info: 'status of job' },
        due_date: { required: false, type: 'number', info: 'Need by date'},
        notes: { required: false, type: 'string', info: 'Job notes'}
      },

      action: function(params, output) {

        handle.create_connection();

        var query = 'INSERT INTO `IR_properties`' +
          '(DateCreated, DateEdited, JobNum, JobContact, JobStatus,' +
          'JobAddress, JobNotes, JobDateNeeded)' +
          'VALUES(NOW(), NOW(), ?, ?, ?,  ?, ?,  ?)';

        // TODO(jeff): validation of fields
        var values = [
          params.jobnum,
          params.client,
          params.status,
          params.address,
          params.notes,
          params.due_date
        ];

        query = handle.format(query, values);

        console.log("create_job:", query);
        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            output.fail('Invalid Request');
          }

          if( result == null ) {
            output.fail('NULL');
          } else {
            output.win(result);
          }
        });

        handle.close_connection();
      }
    },

    delete_job: {
      params: {
        pid: { required: true, type: 'number', info: 'ID of job'}
      },

      action: function(params, output) {

        handle.create_connection();

        var query = 'DELETE FROM `IR_properties` WHERE PropertyKey = ?';
        var values = params.pid;

        console.log("delete_job (QUERY):", query, values);
        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            output.fail('Invalid Request');
          }

          if( result == null ) {
            output.fail('NULL');
          } else {
            output.win(result);
          }
        });

        handle.close_connection();
      }
    },

    update_pr: {
      params: {
        pid: { required: true, type: 'number', info: 'ID of property'},
        jobnum: { required: false, type: 'string', info: 'Drawing number'},
        notes: { required: false, type: 'string', info: 'Job notes'},
        due_date: { required: false, type: 'string', info: 'Need by date'},
        status: { required: false, type: 'number', info: 'status of job' },
        contact: { required: false, type: 'string', info: 'Job contact'},
        // email: { required: false, type: 'string', info: 'Job email'},
        addr: { required: false, type: 'string', info: 'Job address'}
      },

      action: function(params, output) {
        handle.create_connection();

        // TODO(jeff): validation of fields
        if(params.pid) {

          var query = 'UPDATE `IR_properties` ';
          var fields = [];
          var values = [];

          if(params.jobnum) {
            fields.push('JobNum');
            values.push(handle.escape(params.jobnum));
          }

          if(params.notes) {
            fields.push('JobNotes');
            values.push(handle.escape(params.notes));

          }

          if(params.due_date) {
            fields.push('JobDateNeeded');
            values.push(handle.escape(params.due_date));
          }

          if(params.status) {
            fields.push('JobStatus');
            values.push(handle.escape(params.status));

          }

          if(params.contact) {
            fields.push('JobContact');
            values.push(handle.escape(params.contact));
          }

          if(params.email) {
            fields.push('JobEmail');
            values.push(handle.escape(params.email));
          }

          if(params.addr) {
            fields.push('JobAddress');
            values.push(handle.escape(params.addr));
          }

          fields.push("DateEdited");
          values.push('NOW()');

          query += create_update_query(handle, fields, values);
          query += ' WHERE PropertyKey = ?';
          values = handle.escapeId(params.pid);

          if(fields.length > 0) {
            console.log("update_pr: ", query);
            handle.query(query, values, function(err, result, fields) {
              if(err) {
                console.log("ERROR: ", err);
                output.fail('Invalid Request');
              }

              if( result == null ) {
                output.fail('NULL');
              } else {
                output.win(result);
              }
            });
          } else {
            // TODO(jeff): Better err message!
            output.fail('Nothing to update!');
          }
        }

        handle.close_connection();
      }
    },

    search: {
      params: {
        query: { required: true, type: 'string', info: 'Search terms'}
      },

      action: function(params, output) {
        var user_query = '';

        handle.create_connection();

        // TODO(jeff): validation of fields
        if(params.query) {

          user_query = params.query;
          console.log('user_query:', user_query);

          // * NOTE(jeff): Operator '+', i.e.: AND, uses additive word masking on
          // search terms.
          // * NOTE(jeff): Operator '-', i.e.: NOT, applies exclusion word masking on
          // search terms.
          // * NOTE(jeff): Operator '', i.e.: OR, applies no word masking on search
          // terms.
          var mask = {
            inclusive: user_query.split('AND'),
            exclusive: user_query.split('NOT'),
            none: user_query.split('OR'),
          };

          // NOTE(jeff): ...End-user input sanitizing...
          mask.inclusive = handle.escape(mask.inclusive);
          mask.exclusive = handle.escape(mask.exclusive);
          mask.none = handle.escape(mask.none);

          console.log("mask.inclusive:", mask.inclusive);
          console.log("mask.exclusive:", mask.exclusive);
          console.log("mask.no_mask:", mask.none);

          var query = "SELECT * FROM `IR_properties` WHERE MATCH" +
            "(`JobNum`, `JobContact`, `JobNotes`, `JobAddress`) " +
            "AGAINST(? IN BOOLEAN MODE);";
          var values = [
            mask.none,
          ];

          query = handle.format(query, values);

          console.log("search_jobs (QUERY):", query);
          handle.query(query, values, function(err, result, fields) {
            // Failure; ...
            if(err) {
              console.log("ERROR:", err);
              output.fail('Invalid request');
            }

            output.win(result);
          });
        } // end if params.query

        handle.close_connection();
      }
    },

    // user management

    create_user: {
      params: {
        uid: { required: true, type: 'string', info: 'user name'},
        password: { required: true, type: 'string', info: 'unencrypted password'},
        ip: { required: false, type: 'string', info: 'IPv4 TCP address of user'},
      },

      action: function(params, output) {

        handle.create_connection();

        // TODO(jeff): Implement
        var user_ip = '127.0.0.1';

        if(params.ip) {
          user_ip = params.ip;
        }

        var query = 'INSERT INTO `users` SET user_id = ?, ' +
          'user_password = PASSWORD(?), date_created = NOW(), ' +
          'date_edited = NOW(), user_ip = INET_ATON(?)';

        // TODO(jeff): validation of fields
        var values = [ params.uid, params.password, user_ip ];

        query = handle.format(query, values);

        console.log("create_user (QUERY):", query);
        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            output.fail('Invalid Request');
          }

          if( result == null ) {
            output.fail('NULL');
          } else {
            output.win(result);
          }
        });

        handle.close_connection();
      }
    },

    list_users: {
      params: {
        uid: { required: false, type: 'string', info: 'user name' },
        order: { required: false, type: 'string', info: 'Column to sort results by'},
        sort: { required: false, type: 'string', info: 'Ascending or descending order by'},
        limit: { required: false, type: 'number', info: 'Maximum number of results'}
      },

      action: function(params, output) {

        handle.create_connection();

        if(params.order == null) {
          params.order = "DateCreated";
        }

        if(params.sort == null) {
          params.sort = "DESC";
        }

        // TODO(jeff): Impose minimum and maximum limits here!
        // TODO(jefff): Implement pagination!
        if(params.limit == null) {
          params.limit = 50;
        }

        var values = {
          order: params.order,
          sort: params.sort,
          limit: params.limit
        };

        if(params.uid) {
          values.uid = params.uid;
          handle.find_user(values, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            output.win(result);
          });
        } else {
          // NOTE(jeff): Catch-all
          handle.find_user(values, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            output.win(result);
          });
        }

       handle.close_connection();
      }
    },

    delete_user: {
      params: {
        uid: { required: true, type: 'string', info: 'user name'}
      },

      action: function(params, output) {

        handle.create_connection();

        var query = 'DELETE FROM `users` WHERE user_id = ?';
        var values = params.uid;

        query = handle.format(query, values);

        console.log("delete_user (QUERY):", query);
        handle.query(query, '', function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            output.fail('Invalid Request');
          }

          if( result == null ) {
            output.fail('NULL');
          } else {
            output.win(result);
          }
        });

        handle.close_connection();
      }
    },

  }
};
