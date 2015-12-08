var express = require('express');
var router = express.Router();
var app = express();

var util = require('util');
var bodyParser = require('body-parser');

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../models/rpc') } );
// var assert = require('assert');
var app_utils = require('../lib/users/utils.js');
var AppError = require('../lib/Err.js');
var Logger = require('../lib/Logger.js');

var verify_request_body = function(req, res, buf, encoding) {
  // ...
};

var request_body_opts = {
  // Allows rich encoding of objects and arrays, i.e.: JSON
  extended: true,
  // Maximum request body size of 64KB
  limit: 65536,
  // Compressed request bodies shall be deflated, not ignored
  inflate: true,

  // TODO(jeff): Implement validation checking of the request body data;
  // parsing can be aborted if we find anything suspicious!
  verify: verify_request_body
};

form_request_parser = bodyParser.urlencoded(request_body_opts);

// NOTE(jeff): HTTP routes
// TODO(jeff): validation of fields!!

router.all('(/create|/:job_id|/destroy/:job_id)', function(req, res, next) {

  var params = { notifications: [] };
  var err_message = 'Authentication is required to access the requested page.';

  console.log('auth:', req.path);

  if(app_utils.null_or_undefined(req.session) === false &&
     app_utils.null_or_undefined(req.session.user) === false)
  {
    next();
  }

  if(app_utils.null_or_undefined(req.session.user) === true) {
    params.notifications.push(err_message);
    return res.render('login', { params: params } );
  } else {
    var error = new Error("User not authenticated");
    error.status = 401;
    error.code = 401;
    error.data = err_message;
    next(error);
  }
});

// GET job creation
router.get('/create', function(req, res) {
  var params = {};
  res.render('create_job', params);
});

// POST create job
router.post('/create', form_request_parser, function(req, res) {

  if(req.body !== null) {
    // Store the state of the HTTP request body (form data)
    res.locals.job = req.body;
  }

  if(res.locals.job.action) {

    // TODO: Validate user input!
    var job_number = res.locals.job.jobnum;
    var client_name = res.locals.job.client;
    var job_status = 'not assigned';
    var job_notes = res.locals.job.notes;
    var due_date = res.locals.job.due_date.toLowerCase();
    var addr = res.locals.job.address;
    var city = res.locals.job.city;

    // TODO(jeff): This is only a stub!
    if(due_date === 'asap') {
      due_date = '2016-01-01 00:00:00';
    }

    console.log("create job");

    job_status = res.locals.job.status;

    var params = {
      jobnum: job_number,
      client: client_name,
      status: job_status,
      notes: job_notes,
      due_date: due_date,
      address: addr
    };

    rpcJs.input({
      input: { method: 'create_job', params: params },
      callback: function(output) {
        res.redirect('/jobs');
      }
    });
  }
});

var http = require('http');
router.get('/', function(req, res) {

  var params = req.query;
  var user_query = params.query;
  var user_authenticated = false;

  if(req.session.user) {
    user_authenticated = true;
  }

  var querystring = require('querystring');

  var options = {
    hostname: 'scorpio.local',
    port: 3000,
    // path: '/api/v1/jobs?limit=2&query=yeah',
    path: '/api/v1/jobs?' + querystring.stringify(params),
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
      // 'Content-Length': JSON.stringify(params).length,
      'Content-Length': JSON.stringify(params).length,
    },
  };

  var request = http.request(options, function(response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    var body = '';

    response.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      body += chunk;
    });

    response.on('end', function() {
      console.log('No more data in response.');

      var res_body = JSON.parse(body);
      var result_params = {
        results: res_body,
        user_authenticated: user_authenticated
      };

      console.log('completed:', res_body);

      if(res_body.error) {
        res.render('error', { error: res_body.error } );
      } else {
        res.render('jobs', { results: res_body.result } );
      }
    });
  });

  request.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    res.render('error', { error: e } );
  });

  request.write(JSON.stringify(params));
  request.end();

/*
  if(user_query == null || user_query.length < 1) {

    // NOTE(jeff): No query to perform; show all job results
    rpcJs.input({
      input: { method: 'list_pr', params: {} },
      callback: function(output) {
        var params = {
          results: output.result,
          user_authenticated: user_authenticated
        };

        res.render('jobs', params);
      }
    });
  } else {
    // Store state of user input
    res.locals.query = user_query;

    // NOTE(jeff): Got a query to perform; show search results
    rpcJs.input({
      input: { method: 'list_pr', params: { query: user_query } },
      callback: function(output) {
        var params = {
          results: output.result,
          user_authenticated: user_authenticated
        };

        res.render('jobs', params);
      }
    });
  }
*/

});

// GET job details
router.get('/:job_id', form_request_parser, function(req, res) {

  var user_authenticated = false;

  if(req.body !== null) {
    // Store the state of the HTTP request body (form data)
    res.locals.job = req.body;
  }

  if(req.session.user) {
    user_authenticated = true;
  }

  rpcJs.input({
    input: { method: 'list_pr', params: { pid: req.params.job_id } },
    callback: function(output) {
      var params = {
        job: output.result[0],
        user_authenticated: user_authenticated
      };

      res.render('edit_job', params);
    }
  });
});

// POST job update
router.post('/:job_id', form_request_parser, function(req, res) {
  var pid = req.params.job_id;

  if(req.body !== null) {
    // Store the state of the HTTP request body (form data)
    res.locals.job = req.body;
  }

  // TODO: Validate user input!
  if(res.locals.job.action) {
    var job_status = res.locals.job.status;

    var params = {
      pid: pid,
      status: job_status,
      notes: res.locals.job.notes
    };

    rpcJs.input({
      input: { method: 'update_pr', params: params },
      callback: function(output) {
        res.redirect('/jobs');
      }
    });
  }
});

// DELETE job_id
router.get('/destroy/:job_id', function(req, res) {

  // TODO: Validate!
  rpcJs.input({
    input: { method: 'delete_job', params: { pid: req.params.job_id } },
    callback: function(output) {
      res.redirect('/jobs');
    }
  });
});

module.exports = router;

// test code

// dbi.find_property_by_job_id("07-048", function callback(err, result, fields) {
//   if( err ) {
//     console.log("ERROR in find_property_by_job_id function inside /properties route");
//   }

//   var result_size = result.length;

//   console.log("PropertyKey result size:", result_size);
//   for( var idx = 0; idx != result_size; ++idx ) {
//     console.log("PropertyKey (result):", result[idx].PropertyKey);
//   }

//   console.log("JobNum (result):", result[0].JobNum);
// });

// dbi.find_property_by_job_name("07-048", function callback(err, result, fields) {
//   if( err ) {
//     console.log("ERROR in find_property_by_job_id function inside /properties route");
//   }

//   var result_size = result.length;

//   console.log("PropertyKey result size:", result_size);
//   for( var idx = 0; idx != result_size; ++idx ) {
//     console.log("PropertyKey (result):", result[idx].PropertyKey);
//   }

//   console.log("JobNum (result):", result[0].JobNum);
// });
