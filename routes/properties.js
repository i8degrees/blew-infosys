var express = require('express');
var router = express.Router();

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );
var handle = require('../lib/db');
var assert = require('assert');

// NOTE(jeff): JSON RPC routes

router.post('/properties/list_pr/', function(req, res){

  var params = req.query;

  // NOTE(jeff): Initialize our database link
  // handle.create_connection();

  rpcJs.input({
    input: { method: 'list_pr', params: params },
    callback: function(output) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(output.result));
      // res.render('properties', { pr_rows: output.result } );
    }
  });

  // handle.close_connection();
});

router.delete('/properties/destroy/:property_id', function(req, res) {

  // NOTE(jeff): Initialize our database link
  // handle.create_connection();

  rpcJs.input({
    input: { method: 'delete_job', params: { pid: req.params.property_id } },
    callback: function(output) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(output.result));
      // res.render('properties', { pr_rows: output.result } );
    }
  });

  // handle.close_connection();
});

router.post('/properties/list_job_status/', function(req, res){

  var params = req.query;

  // NOTE(jeff): Initialize our database link
  // handle.create_connection();

  rpcJs.input({
    input: { method: 'list_job_status', params: params },
    callback: function(output) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(output.result));
      // res.render('properties', { pr_rows: output.result } );
    }
  });

  // handle.close_connection();
});

router.post('/properties/update_pr/', function(req, res){

  var params = req.query;

  // NOTE(jeff): Initialize our database link
  // handle.create_connection();

  rpcJs.input({
    input: { method: 'update_pr', params: params },
    callback: function(output) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(output.result));
      // res.render('properties', { pr_rows: output.result } );
    }
  });

  // handle.close_connection();
});

router.post('/properties/create_job/', function(req, res){

  var params = req.query;

  // NOTE(jeff): Initialize our database link
  // handle.create_connection();

  rpcJs.input({
    input: { method: 'create_job', params: params },
    callback: function(output) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(output.result));
      // res.render('properties', { pr_rows: output.result } );
    }
  });

  // handle.close_connection();
});

// NOTE(jeff): HTTP routes

// GET http://localhost:8888/api/properties/create
router.get('/properties/create/', function(req, res) {

  var params = {};
  res.render('create_job', params);
});

// GET http://localhost:8888/api/properties/destroy/:job_id
router.get('/properties/destroy/:job_id', function(req, res) {

  // TODO: Validate!
  rpcJs.input({
    input: { method: 'delete_job', params: { pid: req.params.job_id } },
    callback: function(output) {
      res.redirect('/api/properties');
    }
  });
});

// POST http://localhost:8888/api/properties/create
router.post('/properties/create/', function(req, res) {

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

        res.redirect('/api/properties');
      }
    });
  }

});

// http://localhost:8888/api/properties
router.get('/properties', function(req, res) {

  var params = {};

  rpcJs.input({
    input: { method: 'list_pr', params: params },
    callback: function(output) {

      var pr_rows = output.result;
      res.render('properties', { pr_rows: output.result } );
    }
  });

});

// GET http://localhost:8888/api/properties/P2006121549330062039
router.get('/properties/:property_id', function(req, res) {

  rpcJs.input({
    input: { method: 'list_pr', params: { pid: req.params.property_id } },
    callback: function(output) {
      res.render('edit_property', { property: output.result[0] } );
    }
  });

});

// POST http://localhost:8888/api/properties/P2006121549330062039
router.post('/properties/:property_id', function(req, res) {

  var pid = req.params.property_id;

  // Store the state of the HTTP request body (form data)
  res.locals.property = req.body;
  // console.log("cid:",res.locals.property.cid);
  // console.log("jobnum:",res.locals.property.jobnum);
  // console.log("name:",res.locals.property.name);
  console.log("status:",res.locals.property.status);

  // TODO: Validate user input!
  if(res.locals.property.action) {
    console.log("update property");

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
        res.redirect('/api/properties');
      }
    });
  }

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
