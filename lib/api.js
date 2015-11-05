// JSON RPC library
var rpc = require('rpc.js');

// Database handle
var handle = require("../lib/db.js");
var assert = require("assert");

var create_update_query = function(fields, values) {
  var query = new String('');
  var pair_size = fields.length;

  assert(pair_size == values.length);

  for(var idx = 0; idx != pair_size; ++idx) {

    if(idx == 0) {
      query += 'SET ';
    }

    if(idx != (pair_size-1) ) {
      query += fields[idx] + values[idx] + ",";
    } else {
      query += fields[idx] + values[idx];
    }
  }

  return query;
}

// JSON RPC API schema
// TODO(jeff): documentation!
module.exports = {

  // API methods
  methods: {
    list_pr: {
      params: {
        pid: { required: false, type: 'number', info: 'ID of the property' },
        jobnum: { required: false, type: 'number', info: 'Drawing number'},
        order: { required: false, type: 'string', info: 'ORDER BY [field] SQL clause'},
        sort: { required: false, type: 'string', info: 'ASC or DESC SQL clause'},
        limit: { required: false, type: 'number', info: 'LIMIT [num] SQL clause'}
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        if(params.order == null) {
          params.order = "DateCreated";
        }

        if(params.sort == null) {
          params.sort = "DESC";
        }

        // TODO(jeff): Impose minimum and maximum limits here!
        if(params.limit == null) {
          params.limit = "499";
        }

        var opts = {
          order: params.order,
          sort: params.sort,
          limit: params.limit
        };

        // http://localhost:8888/api/properties?jobnum=07-048 (6)
        if(params.pid != null) {
          console.log("pid != null");

          handle.find_property_by_job_id(params.pid, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
            }

            if( result != null ) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        // http://localhost:8888/api/properties?jobnum=07-048 (6)
        if(params.jobnum != null) {
          console.log("jobnum != null");

          handle.find_property_by_job_num(params.jobnum, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
            }

            if( result != null ) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        // http://localhost:8888/api/properties (14979)
        if( params.pid == null && params.jobnum == null ) {
          handle.find_all_properties( opts, function(err, result, fields) {
            if( err) {
              console.log("ERROR: ", err);
            }

            if( result != null ) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        handle.close_connection();
      }
    },

    list_co: {
      params: {
        cname: { required: false, type: 'string', info: 'Name of the client' },
        cid: { required: false, type: 'string', info: 'ID of the client' },
        order: { required: false, type: 'string', info: 'ORDER BY [field] SQL clause'},
        sort: { required: false, type: 'string', info: 'ASC or DESC SQL clause'},
        limit: { required: false, type: 'number', info: 'LIMIT [num] SQL clause'}
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        if(params.order == null) {
          params.order = "DateCreated";
        }

        if(params.sort == null) {
          params.sort = "DESC";
        }

        // TODO(jeff): Impose minimum and maximum limits here!
        if(params.limit == null) {
          params.limit = "499";
        }

        var opts = {
          order: params.order,
          sort: params.sort,
          limit: params.limit
        };

        // http://localhost:8888/api/contacts?name=Jeff
        if(params.cname != null) {
          console.log("cname != ");

          handle.find_contact_by_name(params.cname, function(err, result, fields) {
            if(err) {
              console.log("ERROR in action function inside list_co command");
            }

            if( result != null ) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        // http://localhost:8888/api/contacts?cid=C2003082661975500334
        if(params.cid != null) {
          console.log("cid != ");
          handle.find_contact_by_id(params.cid, function(err, result, fields) {
            if(err) {
              console.log("ERROR in action function inside list_co command");
            }

            if( result != null ) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        if( params.cname == null && params.cid == null ) {
          handle.find_all_contacts(opts, function(err, result, fields) {
            if( err) {
              console.log("ERROR: ", err);
            }

            if( result != null ) {
              // console.log(result.length);
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
        status: { required: true, type: 'number', info: 'Job status'},
        due_date: { required: false, type: 'number', info: 'Need by date'},
        notes: { required: false, type: 'string', info: 'Job notes'}
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        // TODO(jeff): validation of fields

        var query = 'INSERT INTO `IR_properties`' +
          '(DateCreated, DateEdited, JobNum, JobContact, JobStatus,' +
          'JobNotes, JobDateNeeded)' + 'VALUES(NOW(), NOW(), ?, ?, ?, ?, ?)';
        var values = [
          params.jobnum,
          params.client,
          params.status,
          params.notes,
          params.due_date
        ];

        query = handle.format(query, values);

        console.log("create_job:", query);
        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);

            // TODO(jeff): Better err message!
            output.fail('Invalid SQL syntax');
          }

          if( result != null ) {
            output.win(result);
          } else {
            output.fail('Result was NULL');
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
        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        var query = 'DELETE FROM `IR_properties` WHERE PropertyKey = ?';
        var values = params.pid;
        handle.query(query, values, function(err, result, fields) {
          // TODO(jeff): Better err message!
          if(err) {
            console.log("ERROR: ", err);
            output.fail('Invalid SQL syntax');
          }

          if( result != null ) {
            output.win(result);
          } else {
            output.fail('Result was NULL');
          }
        });
        handle.close_connection();
      }
    },

    update_pr: {
      params: {
        pid: { required: true, type: 'number', info: 'ID of property'},
        jobnum: { required: false, type: 'string', info: 'Drawing number'},
        property: { required: false, type: 'string', info: 'Property name'},
        loc: { required: false, type: 'string', info: 'Property location'},
        str: { required: false, type: 'string', info: 'Section, Township, Range'},
        county: { required: false, type: 'string', info: 'County of property'},
        district: { required: false, type: 'string', info: 'District of property'},
        area: { required: false, type: 'number', info: 'Property area'},
        lot: { required: false, type: 'string', info: 'Lot #'},
        block: { required: false, type: 'string', info: 'Lot block #'},
        subdivision: { required: false, type: 'string', info: 'Subdivision'},
        desc: { required: false, type: 'string', info: 'Job description'},
        due_date: { required: false, type: 'string', info: 'Need by date'},
        status: { required: false, type: 'number', info: 'Status of the job'},
        requested_by: { required: false, type: 'string', info: 'Requested by'},
        contact: { required: false, type: 'string', info: 'Job contact'},
        email: { required: false, type: 'string', info: 'Job email'},
        addr: { required: false, type: 'string', info: 'Job address'}
        // cname: { required: false, type: 'string', info: 'Name of the client'},
        // caddr: { required: false, type: 'string', info: 'City assigned property address'},
      },

      action: function(params, output) {
        var result = false;

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        // TODO(jeff): validation of fields
        if(params.pid) {

            var query = 'UPDATE `IR_properties` ';
            var values = '';
            var fields = new Array;
            var values = new Array;

            if(params.jobnum) {
              fields.push("`JobNum` = ");
              values.push(handle.escape(params.jobnum));
            }

            if(params.property) {
              fields.push("`Property` = ");
              values.push(handle.escape(params.property));
            }

            if(params.loc) {
              fields.push("`Location` = ");
              values.push(handle.escape(params.loc));
            }

            // Section, Township & Range: 26/20/30
            if(params.str) {
              fields.push("`SecTwpRge` = ");
              values.push(handle.escape(params.str));
            }

            if(params.county) {
              fields.push("`County` = ");
              values.push(handle.escape(params.county));
            }

            if(params.district) {
              fields.push("`District` = ");
              values.push(handle.escape(params.district));
            }

            if(params.area) {
              fields.push("`Area` = ");
              values.push(handle.escape(params.area));
            }

            if(params.lot) {
              fields.push("`Lot` = ");
              values.push(handle.escape(params.lot));
            }

            if(params.block) {
              fields.push("`Block` = ");
              values.push(handle.escape(params.block));
            }

            if(params.subdivision) {
              fields.push("`Subdivision` = ");
              values.push(handle.escape(params.subdivision));
            }

            if(params.desc) {
              fields.push("`JobDescription` = ");
              values.push(handle.escape(params.desc));
            }

            if(params.due_date) {
              fields.push("`JobDateNeeded` = ");
              values.push(handle.escape(params.due_date));
            }

            if(params.status) {
              fields.push("`JobStatus` = ");
              values.push(handle.escape(params.status));
            }

            if(params.requested_by) {
              fields.push("`JobRequestedBy` = ");
              values.push(handle.escape(params.requested_by));
            }

            if(params.contact) {
              fields.push("`JobContact` = ");
              values.push(handle.escape(params.contact));
            }

            if(params.email) {
              fields.push("`JobEmail` = ");
              values.push(handle.escape(params.email));
            }

            if(params.addr) {
              fields.push("`JobAddress` = ");
              values.push(handle.escape(params.addr));
            }

            fields.push("`DateEdited` = ");
            values.push("NOW()");

            query += create_update_query(fields, values);
            query += ' WHERE PropertyKey = ?';
            values = params.pid;

            if(fields.length > 0) {
              console.log("update_pr: ", query);
              handle.query(query, values, function(err, result, fields) {
                if(err) {
                  console.log("ERROR: ", err);
                }

                if( result != null ) {
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

    list_job_status: {
      params: {
        status: { required: false, type: 'string', info: 'job status >=' }
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        if(params.status != null) {
          console.log("status != null");

          handle.find_all_properties_by_status(params.status, function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
            }

            if(result != null) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }

        if(params.status == null) {
          handle.find_all_properties_by_status("0", function(err, result, fields) {
            if(err) {
              console.log("ERROR: ", err);
            }

            if(result != null) {
              // console.log(result.length);
              output.win(result);
            }
          });
        }
        handle.close_connection();
      }
    },

/*
    update_job_status: {
      info: 'Update job status',
      group: 'util',
      params: {
        pid: { required: true, type: 'number', info: 'property ID' },
        status: { required: true, type: 'string', info: 'job status' }
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        var query =
          'UPDATE `IR_properties` SET `JobStatus` = "' + params.status + '"' +
          ' WHERE `PropertyKey` = "' + params.pid + '"';

        var values = '';
        // console.log("update_job_status: ", query);

        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
          }

          if(result != null) {
            output.win(result);
          }
        });
      }
    },

    clear_job_status: {
      info: 'Reset job status',
      group: 'util',
      params: {
        pid: { required: true, type: 'string', info: 'property ID' }
      },

      action: function(params, output) {

        // NOTE(jeff): Initialize our database link
        handle.create_connection();

        var query =
          'UPDATE `IR_properties` SET `JobStatus` = NULL';
        var search_match = ' WHERE `PropertyKey` = ?';
        var values = params.pid;

        query = query + search_match;
        // console.log("clear_job_status: ", query);

        handle.query(query, values, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
          }

          if(result != null) {
            output.win(result);
          }
        });
      }
    }
*/
  }
}
