var assert = require("assert");
var util = require('util');
var app_utils = require("../lib/users/utils.js");
var Logger = require("../lib/Logger.js");
var ecode = require("../lib/Err.js");

// static
var create_update_query = function(db, fields, values) {
  var query = '';
  var pair_size = fields.length;

  assert(pair_size == values.length);

  for(var idx = 0; idx != pair_size; ++idx) {

    if(idx === 0) {
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

  check_params: function(handle, params, callback) {
    var response = {};
    var err = null;

    assert(handle.handle_ !== null && app_utils.function(handle.find) !== false,
           "The handle function argument must be an instance of the Jobs " +
           "class");

    assert(app_utils.function(handle.handle_.query) !== false,
           "The callback function argument must be a function pointer");

    assert(app_utils.function(callback) !== false,
           "The callback function argument must be a function pointer");

    if(app_utils.object(params) === false) {
      err = {
        code: ecode.http.unproccessable.code,
        message: ecode.http.unproccessable.message,
        data: 'Params object must be a JSON object'
      };
    }

    return err;
  },

  list_jobs: function(handle, params, callback) {
    var err = {};
    var response = {};
    response.method = 'list_jobs';

    err = this.check_params(handle, params, callback);

    if(err) {
      return callback({error: err});
    }

    // TODO(jeff): End-user input sanitizing

    handle.find(params, function(err, rows, fields) {
      if(err) {
        response.error = err;
        return callback(response);
      }

      response.result = rows;
      if(response.result.length < 1) {
        response.error = {};
        response.error.status = ecode.http.not_found.code;
        response.error.code = ecode.http.not_found.code;
        response.error.message = ecode.http.not_found.message;
        response.error.data = ecode.http.not_found.data;
      }

      callback(response);
    });
  },

  remove_job: function(handle, params, callback) {
    var err = {};
    var response = {};
    response.method = 'remove_job';

    err = this.check_params(handle, params, callback);

    if(err) {
      return callback({error: err});
    }

    // TODO(jeff): End-user input sanitizing

    handle.remove(params, function(err, rows, fields) {
      if(err) {
        response.error = err;
        return callback(response);
      }

      // response.result = rows;

      if(rows.affectedRows === 0) {
        response.error = {};
        response.error.status = ecode.http.not_found.code;
        response.error.code = ecode.http.not_found.code;
        response.error.message = ecode.http.not_found.message;
        response.error.data = 'Unable to remove job';
        return callback(response);
      } else if(rows.affectedRows === 1) {
        response.status = ecode.http.no_content.code;
        return callback(response);
      }

    });
  },

  update_job: function(handle, params, callback) {
    var err = {};
    var response = {};
    response.method = 'update_job';

    err = this.check_params(handle, params, callback);

    if(err) {
      return callback({error: err});
    }

    // TODO(jeff): End-user input sanitizing

    handle.update(params, function(err, rows, fields) {
      if(err) {
        response.error = err;
        return callback(response);
      }

      // response.result = rows;

      if(rows === null) {
        response.error = {};
        response.error.status = ecode.http.not_found.code;
        response.error.code = ecode.http.not_found.code;
        response.error.message = ecode.http.not_found.message;
        response.error.data = 'Failed to update job.';
        return callback(response);
      } else if(rows.affectedRows === 0) {
        response.error = {};
        response.error.status = ecode.http.not_found.code;
        response.error.code = ecode.http.not_found.code;
        response.error.message = ecode.http.not_found.message;
        response.error.data = 'Failed to update job.';
        return callback(response);
      } else if(rows.affectedRows === 1) {
        response.status = ecode.http.no_content.code;
        return callback(response);
      }
    });
  },
};
/*
  // apiSchema: {
    // API methods
    methods: {
      list_pr: {
        params: {
          pid: { required: false, type: 'number', info: 'ID of the property' },
          jobnum: { required: false, type: 'number', info: 'Drawing number'},
          status: { required: false, type: 'number', info: 'status of job' },
          query: { required: false, type: 'string', info: 'Search terms'},
          order: { required: false, type: 'string', info: 'Column to sort results by'},
          sort: { required: false, type: 'string', info: 'Ascending or descending order by'},
          limit: { required: false, type: 'number', info: 'Maximum number of results'}
        },

        action: function(params, output) {
          var completed = false;

          handle.create_connection();

          // if(util.isNullOrUndefined(params.order) === true) {
          //   params.order = "DateEdited";
          // }

          // if(util.isNullOrUndefined(params.sort) === true) {
            // params.sort = "DESC";
          // }

          // TODO(jeff): Impose minimum and maximum limits here!
          // TODO(jefff): Implement pagination!
          // if(util.isNullOrUndefined(params.limit) === true) {
            // params.limit = 50;
          // }

          var params = {
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
            completed = true;
            return;
          }

          // if(params.jobnum) {
          //   console.log("jobnum != null");

          //   handle.find_property_by_job_num(params.jobnum, function(err, result, fields) {
          //     if(err) {
          //       console.log("ERROR: ", err);
          //       output.fail('Invalid Request');
          //     }

          //     output.win(result);
          //   });
          //   completed = true;
          // }

          if(params.status) {
            handle.find_job_by_status(params.status, function(err, result, fields) {
              if(err) {
                console.log("ERROR: ", err);
                output.fail('Invalid Request');
              }

              if(result == null) {
                output.fail('Invalid Request');
              } else {
                output.win(result);
              }
            });
            completed = true;
            return;
          }

          var user_query = '';
          // TODO(jeff): validation of fields
          if(params.query) {

            user_query = params.query;
            console.log('user_query:', user_query);

            // * NOTE(jeff): Operator '+', i.e.: AND, uses additive word
            // masking on search terms.
            // * NOTE(jeff): Operator '-', i.e.: NOT, applies exclusion word
            // masking on search terms.
            // * NOTE(jeff): Operator '', i.e.: OR, applies no word masking on
            // search terms.
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
            var values = [mask.none];

            query = handle.format(query, values);

            console.log("search_jobs (QUERY):", query);
            handle.query(query, values, function(err, result, fields) {
              // Failure; ...
              if(err) {
                console.log("ERROR:", err);
                output.fail('Invalid request');
              }

              if(result == null) {
                output.fail('NULL');
              } else {
                output.win(result);
              }

            });
            completed = true;
          } // end if params.query

          // NOTE(jeff): Catch-all case
          if(completed == false) {
            handle.find_jobs(params, function(err, result, fields) {
              if(err) {
                console.log("ERROR: ", err);
                output.fail('Invalid Request');
              }

              if(result == null) {
                output.fail('Invalid Request');
              } else {
                output.win(result);
              }
            });
            completed = true;
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

            if(result == null) {
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

            if(result == null) {
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

            var values = {};

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

            // query += create_update_query(handle, fields, values);
            // query += ' WHERE PropertyKey = ?';
            // values = handle.escape(params.pid);
            var query = 'UPDATE `IR_properties` SET ? WHERE PropertyKey = ?';
            query = handle.format(query, [values, params.pid]);
            handle.query(query, function(err, result, fields) {
              if(err) {
                console.log("ERROR: ", err);
                output.fail('Invalid Request');
              }

              if(result == null) {
                output.fail('NULL');
              } else {
                output.win(result);
              }
            });
          } // end if params.pid
        }
      },

      // user management

      create_user: {
        params: {
          user_id: { required: true, type: 'string', info: 'user name'},
          // TODO(jeff): Rename to user_password
          password: { required: true, type: 'string', info: 'unencrypted password'},
          user_ip: { required: false, type: 'string', info: 'IPv4 TCP address of user'},
        },

        action: function(params, output) {

          handle.create_connection();

          handle.add_user(params, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            if(result == null) {
              output.fail('NULL');
            } else {
              result.message = 'Success! The user ' + params.user_id +
                ' has been created.';
              output.win(result);
            }
          });

          handle.close_connection();
        }
      },

      list_users: {
        params: {
          user_id: { required: false, type: 'string', info: 'user name' },
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

          if(params.user_id) {
            values.user_id = params.user_id;
          }

          handle.find_user(values, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            output.win(result);
          });

          handle.close_connection();
        }
      },

      remove_user: {
        params: {
          user_id: { required: true, type: 'string', info: 'user name'}
        },

        action: function(params, output) {

          handle.create_connection();

          handle.remove_user(params, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            if(result == null) {
              output.fail('NULL');
            } else if(result.affectedRows == 0) {
              output.fail('Could not remove user');
            } else {
              output.win(result);
            }
          });

          handle.close_connection();
        }
      },

      update_user: {
        params: {
          user_id: { required: true, type: 'string', info: 'user name'},
          user_password: { required: false, type: 'string', info: 'unencrypted password'},
          user_ip: { required: false, type: 'string', info: 'IPv4 TCP address of user'},
          last_login: { required: false, type: 'string', info: 'last login timestamp'}
        },

        action: function(params, output) {

          handle.create_connection();

          handle.update_user(params, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
              output.fail('Invalid Request');
            }

            if(result == null) {
              output.fail('NULL');
            } else {
              output.win(result);
            }
          });

          handle.close_connection();
        }
      },
    }
    // } // end apiSchema
};
*/

// rpc.server('http', {
//   port: process.env.RPC_PORT || 8000,
//   address: process.env.RPC_HOST || "0.0.0.0",

//   // NOTE(jeff): API Schema for our HTTP JSON-RPC server
//   gateway: rpc.gateway({
//     schema: module.exports.apiSchema
//   })
// });
