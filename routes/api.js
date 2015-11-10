var express = require('express');
var router = express.Router();

// var db_handle = require('../lib/db');
var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );

output_result = function(res, result) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));
}

output_fail = function(res, err) {
  console.log("ERROR: ", err);
  output_result(res, err);
}

// NOTE(jeff): JSON RPC routes

// pid (number) -- ID of the property
// jobnum (number) -- Drawing number
// order (string) -- ORDER BY [field] SQL clause
// sort (string) -- ASC or DESC SQL clause,
// limit (number) -- LIMIT [num] SQL clause
router.get('/jobs', function(req, res) {

  var rpc = JSON.parse(req.body.rpc);
  var params = rpc.params;

  rpcJs.input({
    input: { method: 'list_pr', params: params },
    callback: function(output) {
      output_result(res, output);
    }
  });
});

router.get('/jobs/list_status', function(req, res){

  var rpc = JSON.parse(req.body.rpc);
  var params = rpc.params;

  rpcJs.input({
    input: { method: 'list_job_status', params: params },
    callback: function(output) {
      output_result(res, output);
    }
  });
});

router.put('/jobs', function(req, res){

  var rpc = JSON.parse(req.body.rpc);
  var params = rpc.params;

  rpcJs.input({
    input: { method: 'update_pr', params: params },
    callback: function(output) {
      output_result(res, output);
    }
  });
});

// jobnum(string) -- Drawing number
// client (string) -- Client name
// status (number) -- Job status
// due_date (number) -- Need by date
// notes (string) -- Job notes
router.post('/jobs', function(req, res){

  var rpc = JSON.parse(req.body.rpc);
  var params = rpc.params;

  rpcJs.input({
    input: { method: 'create_job', params: params },
    callback: function(output) {
      output_result(res, output);
    }
  });
});

// pid (number) REQUIRED -- ID of job
router.delete('/jobs', function(req, res) {

  var rpc = JSON.parse(req.body.rpc);
  var params = rpc.params;

  rpcJs.input({
    input: { method: 'delete_job', params: params },
    callback: function(output) {
      output_result(res, output);
    }
  });

});

module.exports = router;
