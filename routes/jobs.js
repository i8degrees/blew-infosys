var express = require('express');
var router = express.Router();

var handle = require('../lib/db');
var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );
// var assert = require('assert');

var JobStatus = {
  NULL: 0,
  FIELDWORK: 1,
  DRAFTING: 2,
  REVIEW: 3,
  COMPLETED: 4,

  str: function(id) {
    var result = '';

    if(id == JobStatus.NULL) {
      result = "Not assigned";
    } else if(id == JobStatus.FIELDWORK) {
      result = "Fieldwork";
    } else if(id == JobStatus.DRAFTING) {
      result = "Drafting";
    } else if(id == JobStatus.REVIEW) {
      result = "Review";
    } else if(id == JobStatus.COMPLETED) {
      result = "Completed";
    }

    return result;
  }
};

// NOTE(jeff): HTTP routes

// GET job creation
router.get('/create', function(req, res) {

  var params = {};
  res.render('create_job', params);
});

// POST create job
router.post('/create', function(req, res) {

  // Store the state of the HTTP request body (form data)
  res.locals.job = req.body;

  if(res.locals.job.action) {

    // TODO: Validate user input!
    var job_number = res.locals.job.jobnum;
    var client_name = res.locals.job.client;
    var job_status = JobStatus.STATUS_NULL;
    var job_notes = res.locals.job.notes;
    var due_date = res.locals.job.due_date;
    var addr = res.locals.job.address;
    var city = res.locals.job.city;

    console.log("create job");

    if(res.locals.job.status >= JobStatus.NULL &&
       res.locals.job.status <= JobStatus.COMPLETED)
    {
      job_status = res.locals.job.status;
    }

    var params = {
      jobnum: job_number,
      client: client_name,
      status: job_status,
      notes: job_notes,
      due_date: due_date,
      address: addr,
      city: city
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

// GET job details
router.get('/:job_id', function(req, res) {

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
    console.log("update job");

    var job_status = JobStatus.STATUS_NULL;

    if(res.locals.job.status >= JobStatus.NULL &&
       res.locals.job.status <= JobStatus.COMPLETED)
    {
      job_status = res.locals.job.status;
    }

    rpcJs.input({
      input: { method: 'update_pr', params: { pid: pid, status: job_status } },
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
