var express = require('express');
var router = express.Router();
var app = express();
// Content-Type: 'application/json' body request parser
// var bodyParser = require('body-parser');

var DBC = require('../models/DatabaseConfig.js');
var MySQLDatabase = require('../models/MySQLDatabase.js');
var Job = require('../models/Job.js');
// var rpc = require('rpc.js');
// var rpcJs = rpc.gateway( { schema: require('../models/rpc') } );
var rpc = require('../models/rpc.js');
var app_utils = require('../lib/users/utils.js');
var account = require('../lib/users/utils');
var get_ip = require('ipware')().get_ip;
var assert = require('assert');
var Logger = require("../lib/Logger.js");
var ecode = require('../lib/Err.js');

/*
var verify_request_body = function(req, res, buf, encoding) {
  // ...
};

var request_body_opts = {
  // Accept **only** JSON arrays and objects -- a subset of what JSON.parse is
  // capable of
  strict: true,
  // Maximum request body size of 64KB
  limit: 65536,
  // Compressed request bodies shall be deflated, not ignored
  inflate: true,

  // TODO(jeff): Implement validation checking of the request body data;
  // parsing can be aborted if we find anything suspicious!
  verify: verify_request_body,
};
*/

// http://www.jsonrpc.org/specification
output_fail = function(res, params, err) {

  var env = app_utils.env();
  var response = {};

  response.jsonrpc = "2.0";
  response.error = {};
  response.error.status = err.status || 400;

  if(res.headersSent) {
    // NOTE(jeff): HTTP request has already been responded to -- we must
    // continue onwards; it is likely that our routing somewhere is not done
    // correctly!

    var err_msg = "Failed to output JSON-RPC result; HTTP response headers" +
      " have already been sent out.";
    Logger.err("BLEW_LOG_CATEGORY_APPLICATION", err_msg);
    return;
  }

  // NOTE(jeff): err.code is the error code number, an index number
  // representing the error string; see also, man 2 intro.

  // NOTE(jeff): err.errno is the string representation of the error, which is
  // always prefixed by "E", followed by capital letters and may be referenced
  // in the 'intro' manual page, section 2.
  response.error.code = err.errno || err.code || ecode.rpc.app.code;
  response.error.message = err.message || ecode.rpc.app.message;
  response.error.data = err.data || null;

  if(app_utils.null(response.error.data) === true) {
    delete response.error.data;
  }

  // NOTE(jeff): This value **must** be NULL when an err has occurred
  if(app_utils.has(params, 'id') === true) {
    response.id = null;
  }

  Logger.err("BLEW_LOG_CATEGORY_APPLICATION", response.error.status,
              response.error.code, response.error.message, ':',
              response.error.data);

  var json_str = JSON.stringify(response);

  try {
    // JSON.parse(json_str + 'f');
    JSON.parse(json_str);
  } catch(e) {
    response.error.status = ecode.http.unproccessable.code;
    response.error.code = ecode.http.unproccessable.code;
    response.error.message = 'Problems parsing JSON';
    response.error.data = e.message;
  }

  if(env === 'testing' || env === 'production') {
    // response.error.message = 'Invalid request';
    delete response.error.data;
    delete response.error.stack;
  }

  res.charset = 'utf8';
  res.status(response.error.status);
  res.json(response);
  res.end();
};

// http://www.jsonrpc.org/specification
output_res = function(res, params, result) {
  var status_code = result.status || 200;
  var response = {};

  if(res.headersSent) {
    // NOTE(jeff): HTTP request has already been responded to -- we must
    // continue onwards; it is likely that our routing somewhere is not done
    // correctly!

    var err_msg = "Failed to output JSON-RPC result; HTTP response headers" +
      " have already been sent out.";
    Logger.err("BLEW_LOG_CATEGORY_APPLICATION", err_msg);
    return;
  }

  response.jsonrpc = "2.0";
  // response.num_results = result.length || 0;

  // TODO(jeff): Implement
  response.method = result.method || '';

  if(app_utils.has(params, 'id') === true) {
    response.id = params.id;
  }

  // NOTE(jeff): This **must** not exist when an err has occurred
  response.result = result.result || undefined;
  response.status = result.status || undefined;
  response.message = result.message || undefined;

  var json_str = JSON.stringify(response);

  try {
    // JSON.parse(json_str + 'f');
    JSON.parse(json_str);
  } catch(e) {
    var err = {};
    err.status = ecode.http.unproccessable.code;
    err.code = ecode.http.unproccessable.code;
    err.message = 'Problems parsing JSON';
    err.data = e.message;

    return output_fail(res, params, err);
  }

  res.charset = 'utf8';
  res.status(status_code);
  res.json(response);
  res.end();
};

// app.use( bodyParser.json(request_body_opts) );

// NOTE(jeff): JSON RPC routes
//
// Request bodies should be url encoded with a header of,
// Content-Type: 'application/x-www-form-urlencoded'
//
// curl example:
//
// curl -X [HTTP_VERB] -H "Content-Type: application/x-www-form-urlencoded"
// --data-urlencode 'rpc={ "params": {} }'
//

// TODO(jeff): user authentication for RPC API routes
// router.all('*', function(req, res, next) {

//   var params = { notifications: [] };
//   var err_message = 'Authentication is required to access the requested page.';

//   console.log('auth:', req.path);

//   if(app_utils.null_or_undefined(req.session) === false &&
//      app_utils.null_or_undefined(req.session.user) === false)
//   {
//     next();
//   } else {
//     var error = {};
//     error.status = ecode.http.unauthorized.code;
//     error.code = ecode.http.unauthorized.code;
//     error.message = ecode.http.unauthorized.message;
//     error.data = err_message;
//     output_fail(res, params, error);
//   }
// });

router.use( function(req, res, next) {
  var config = res.app.get('server_config');
  var response_timeout = config.timeout || app_utils.seconds(60);
  var err = {};

  res.setTimeout(response_timeout, function() {
    Logger.err("BLEW_LOG_CATEGORY_APPLICATION",
               'Server timed out waiting on a response!');

    err.status = ecode.http.timeout.code;
    err.message = ecode.http.timeout.message;
    err.data = ecode.http.timeout.data;
    output_fail(res, null, err);
  });

  next();
});

// TODO(jeff): validation of fields!!

router.get('/jobs', function(req, res, next) {

  var params = req.query;

  // var db = new MySQLDatabase([]);
  // var db = new MySQLDatabase({});
  // var db = new MySQLDatabase(null);

  // var connections = req.app.get('server_config');
  // var db = connections.pool.connection();

  var db = new MySQLDatabase(DBC[0]);
  // var db = new MySQLDatabase(dbc[1]); // err

  var jobs = new Job(db);

  db.open( function(err) {
    if(err) {
      output_fail(res, params, err);
      return db.close();
    }

    rpc.list_jobs(jobs, params, function(output) {
      if(output.error) {
        output_fail(res, params, output.error);
        return db.close();
      }

      output_res(res, params, output);
      db.close();
    });
  });

});

router.put('/jobs', function(req, res, next) {

  var params = req.body;

  var db = new MySQLDatabase(DBC[0]);
  // var db = new MySQLDatabase(dbc[1]); // err

  var jobs = new Job(db);

  db.open( function(err) {
    if(err) {
      output_fail(res, params, err);
      return db.close();
    }

    rpc.update_job(jobs, params, function(output) {
      if(output.error) {
        output_fail(res, params, output.error);
        return db.close();
      }

      output_res(res, params, output);
      db.close();
    });
  });

  // handle.query(query, function(err, result, fields) {
  //   if(err) {
  //     console.log("ERROR: ", err);
  //     set_error(res, 400, 'Invalid Request');
  //     handle.close_connection();
  //     return next();
  //   }

  //   if(result === null) {
  //     var message = 'Failed to update job.';
  //     result = message;
  //     set_result(res, result, params);
  //     handle.close_connection();
  //     return next();
  //   } else {
  //     if(result.affectedRows == 1) {
  //       // Success; the database has been updated!
  //       var message = 'Job has been updated.';
  //       result = message;

  //       set_result(res, result, params);
  //       handle.close_connection();
  //       return next();
  //     } else if(result.affectedRows == 0) {
  //       // Err; this is probably because the job record does not exist...
  //       var message = 'Failed to update job.';
  //       // result = message;

  //       set_error(res, 400, message);
  //       handle.close_connection();
  //       return next();
  //     }
  //   }
  // });
});

router.post('/jobs', function(req, res, next){

  if(exists(req.body) == false) {
    // HTTP Bad Request
    return res.sendStatus(400);
  }

  var params = req.body.params;

  rpcJs.input({
    input: { method: 'create_job', params: params },
    callback: function(output) {
      // output_res(res, params, output);
      set_result(res, params, output.result);
      return next();
    }
  });
});

// pid (number) REQUIRED -- ID of job
router.delete('/jobs/:job_id', function(req, res, next) {

  // TODO(jeff): Implement sanitizing of end-user input, such as passed in job
  // ids.
  //
  //    See also:
  // https://github.com/felixge/node-mysql#escaping-query-identifiers

  var params = req.params;

  var db = new MySQLDatabase(DBC[0]);
  var jobs = new Job(db);

  db.open( function(err) {
    if(err) {
      output_fail(res, params, err);
      return db.close();
    }

    rpc.remove_job(jobs, params, function(output) {
      if(output.error) {
        output_fail(res, params, output.error);
        return db.close();
      }

      output_res(res, params, output);
      db.close();
    });
  });

});

router.get('/users', function(req, res, next) {

  if(exists(req.body) == false) {
    // HTTP Bad Request
    return res.sendStatus(400);
  }

  // var params = req.body.params;
  var params = req.query;

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

  if(typeof params.user_id != 'undefined') {
    values.user_id = params.user_id;
  }

  handle.find_user(values, function(err, result, fields) {
    if(err) {
      console.log("ERROR: ", err);
      if(app.get('env') === 'development') {
        set_error(res, err.status, err);
      } else {
        set_error(res, err.status, 'Invalid Request');
      }
      return;
    }

    // output_res(res, params, result);
    set_result(res, result, params);
    handle.close_connection();
    return next();
  });

  // handle.close_connection();

  // rpcJs.input({
  //   input: { method: 'list_users', params: params },
  //   callback: function(output) {
  //     output_res(res, params, output);
  //   }
  // });

  // return next();
});

router.put('/users', function(req, res, next) {

  if(exists(req.body) == false) {
    // HTTP Bad Request
    return res.sendStatus(400);
  }

  var params = req.body.params;

  rpcJs.input({
    input: { method: 'update_user', params: params },
    callback: function(output) {
      // output_res(res, params, output);
      set_result(res, output.result, params);
      return next();
    }
  });
});

router.post('/users', function(req, res, next) {

  // NOTE(jeff): Record the user's IP address
  var ip = get_ip(req);

  if(exists(req.body) == false) {
    // HTTP Bad Request
    return res.sendStatus(400);
  }

  var params = req.body.params;

  // rpcJs.input({
  //   input: { method: 'create_user', params: params },
  //   callback: function(output) {
  //     set_result(res, output.result, params);
  //     return next();
  //   }
  // });

  handle.create_connection();

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
      if(app.get('env') === 'development') {
        set_error(res, err.status, err);
      } else {
        set_error(res, err.status, 'Invalid Request');
      }
      return;
    }

    if(result.length > 0) {
      console.log("r:",result);

      if(result[0].user_id != params.user_id) {
        handle.add_user(params, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            if(app.get('env') === 'development') {
              set_error(res, 400, err);
            } else {
              set_error(res, 400, 'Invalid Request');
            }
            return next();
          }

          var message = 'Success! The user ' + params.user_id +
            ' has been added.';
          result = message;
          set_result(res, result, params);
          return next();
        });
      } else {
        // Err; this is probably because the user already exists
        var message = 'Could not add user.';
        result = message;
        set_result(res, result, params);
        handle.close_connection();
        return next();
      }
    } else {
      handle.add_user(params, function(err, result, fields) {
        if(err) {
          console.log("ERROR: ", err);
          if(app.get('env') === 'development') {
            set_error(res, 400, err);
          } else {
            set_error(res, 400, 'Invalid Request');
          }
          return next();
        }

        var message = 'Success! The user ' + params.user_id +
          ' has been added.';
        result = message;
        set_result(res, result, params);

        handle.close_connection();
        return next();
      });
    }
  });
});

router.delete('/users', function(req, res, next) {

  if(exists(req.body) == false) {
    // HTTP Bad Request
    return res.sendStatus(400);
  }

  var params = req.body.params;

  // rpcJs.input({
  //   input: { method: 'remove_user', params: params },
  //   callback: function(output) {
  //     // output_res(res, params, output);
  //     set_result(res, output.result, params);
  //     return next();
  //   }
  // });

  handle.create_connection();

  var values = {
    order: params.order,
    sort: params.sort,
    limit: 1,
  };

  if(params.user_id) {
    values.user_id = params.user_id;
  }

  handle.find_user(values, function(err, result, fields) {
    if(err) {
      console.log("ERROR: ", err);
      if(app.get('env') === 'development') {
        set_error(res, err.status, err);
      } else {
        set_error(res, err.status, 'Invalid Request');
      }
      return;
    }

    console.log("r:",result);

    console.log("params.user_id:",params.user_id);
    if(result[0]) {
      console.log("result.user_id:",result[0].user_id);
      if(result[0].user_id == params.user_id) {

        handle.remove_user(params, function(err, result, fields) {
          if(err) {
            console.log("ERROR: ", err);
            if(app.get('env') === 'development') {
              set_error(res, 400, err);
            } else {
              set_error(res, 400, 'Invalid Request');
            }
            return next();
          }

          var message = 'Success! The user ' + params.user_id +
            ' has been removed.';
          console.log("m:",message);
          // result.message = message;
          set_result(res, result, params);
          return next();
        });
      }
      console.log('could not find user');
      return next();
    } else {
      // FIXME
      var message = 'Could not remove user.';
      result = message;
      console.log("err:",message);
      set_error(res, 400, message);
      return next();
    }
  });

  handle.close_connection();

  next();
});

module.exports = router;
