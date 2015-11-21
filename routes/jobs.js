var express = require('express');
var router = express.Router();
var app = express();

var handle = require('../lib/db');
var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );
// var assert = require('assert');

// NOTE(jeff): HTTP routes
// TODO(jeff): validation of fields!!

// GET job creation
router.get('/create', function(req, res) {

  var params = {};
  res.render('create_job', params);
});

// POST create job
router.post('/create', function(req, res) {
  // var JobStatus = res.locals.helpers.JobStatus;

  // Store the state of the HTTP request body (form data)
  res.locals.job = req.body;

  if(res.locals.job.action) {

    // TODO: Validate user input!
    var job_number = res.locals.job.jobnum;
    var client_name = res.locals.job.client;
    var job_status = 'not assigned';
    var job_notes = res.locals.job.notes;
    var due_date = res.locals.job.due_date;
    var addr = res.locals.job.address;
    var city = res.locals.job.city;

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

// GET all job details
router.get('/', function(req, res) {
  var params = req.query;

  rpcJs.input({
    input: { method: 'list_pr', params: params },
    callback: function(output) {

      var result = output.result;
      res.render('jobs', { results: result } );
    }
  });
});

/*  SQL Query
    SELECT * FROM IR_properties
    WHERE MATCH (JobNum, JobNotes,JobContact) AGAINST
    ('07-048 07-049 +boo -carp' IN BOOLEAN MODE);
*/

router.get('/search', function(req, res) {

  // NOTE(jeff): The 'q' HTTP GET parameter will be passed along in the
  // response headers of the request!
  var params = req.query;
  var user_query = null;
  var results = [];

  if(params.q == null || params.q.length < 1) {
    user_query = new String();
  } else {

    user_query = params.q;
  }

  console.log('user_query:', user_query);

  handle.create_connection();

  // var user_query = handle.escape(params.q);
  // var user_query = params.q;

  // var user_query = 'carp +boobies -dev';

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

  res.locals.query = user_query;
  console.log("res.locals.query:", res.locals.query);

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
      var errno = {
        error: {
          status: '500 - Application err',
          message: 'Application err'
        }
      };

      res.render('error', errno);
    } else {
      // Success! ....
      res.render('search', { results: result } );
    }

  });

  handle.close_connection();
/*
} else {
  // TODO(jeff): Clean up / remove (?) this section
  var params = req.query;
  params.q = '';
  results = [
    // {'JobContact': 'dev', 'JobNum': '15-324', 'Notes': 'boobies?'},
    // {'JobContact': 'null', 'JobNum': '13-001', 'Notes': 'n/a'}
  ];

  res.render('search', { results: results } );
}
*/
});

// GET job details
router.get('/:job_id', function(req, res) {

  // Store the state of the HTTP request body (form data)
  res.locals.job = req.body;
  console.log(res.locals.job);

  rpcJs.input({
    input: { method: 'list_pr', params: { pid: req.params.job_id } },
    callback: function(output) {
      res.render('edit_job', { job: output.result[0] } );
    }
  });
});

// POST job update
router.post('/:job_id', function(req, res) {
  var pid = req.params.job_id;

  // Store the state of the HTTP request body (form data)
  res.locals.job = req.body;

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
