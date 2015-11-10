var express = require('express');
var router = express.Router();

var handle = require('../lib/db');
var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );
// var assert = require('assert');

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
    var job_status = 0;
    var job_notes = res.locals.job.notes;
    var due_date = res.locals.job.due_date;

    console.log("create job");

    if(res.locals.job.status == "Ordered") {
      job_status = 1;
    } else if(res.locals.job.status == "In the Field") {
      job_status = 2;
    } else if(res.locals.job.status == "In drafting") {
      job_status = 3;
    } else if(res.locals.job.status == "Needs Review") {
      job_status = 4;
    } else if(res.locals.job.status == "Revisions") {
      job_status = 5;
    } else if(res.locals.job.status == "Completed") {
      job_status = 6;
    } else {
      // FIXME
      job_status = 0;
    }

    var params = {
      jobnum: job_number,
      client: client_name,
      status: job_status,
      notes: job_notes,
      due_date: due_date
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
  res.locals.property = req.body;

  // TODO: Validate user input!
  if(res.locals.property.action) {
    console.log("update job");

    var job_status = 0;
    if(res.locals.property.status == "Ordered") {
      job_status = 1;
    } else if(res.locals.property.status == "In the Field") {
      job_status = 2;
    } else if(res.locals.property.status == "In drafting") {
      job_status = 3;
    } else if(res.locals.property.status == "Needs Review") {
      job_status = 4;
    } else if(res.locals.property.status == "Revisions") {
      job_status = 5;
    } else if(res.locals.property.status == "Completed") {
      job_status = 6;
    } else {
      // FIXME
      job_status = 0;
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
