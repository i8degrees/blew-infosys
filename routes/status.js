var express = require('express');
var router = express.Router();

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );

router.get('/status', function(req, res) {

  var job_number = req.query['jobnum'];
  var pid = req.query['pid'];

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "0" } },
    callback: function(output) {

      var results = output.result;
      var results_size = results.length;

      var results_ordered = new Array; // 1
      var results_field = new Array; // 2
      var results_drafting = new Array; // 3
      var results_review = new Array; // 4
      var results_completed = new Array; // 6

      for( var idx = 0; idx != results_size; ++idx ) {
        if(results[idx].JobStatus == "1") {
          results_ordered.push(results[idx]);
        } else if(results[idx].JobStatus == "2") {
          results_field.push(results[idx]);
        } else if(results[idx].JobStatus == "3") {
          results_drafting.push(results[idx]);
        } else if(results[idx].JobStatus == "4") {
          results_review.push(results[idx]);
        } else if(results[idx].JobStatus == "6") {
          results_completed.push(results[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: results_ordered,
        field_jobs: results_field,
        drafting_jobs: results_drafting,
        review_jobs: results_review,
        completed_jobs: results_completed
      };

      res.render('status', page_params);
    }
  });
});

router.get('/status/ordered', function(req, res) {

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "1" } },
    callback: function(output) {

      var result = output.result;
      var results_size = result.length;

      var results = new Array;
      for( var idx = 0; idx != results_size; ++idx ) {
        if(result[idx].JobStatus == "1") {
          results.push(result[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: results,
        field_jobs: null,
        drafting_jobs: null,
        review_jobs: null,
        completed_jobs: null,
      };

      res.render('status', page_params);
    }
  });

});

router.get('/status/field', function(req, res) {

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "2" } },
    callback: function(output) {

      var result = output.result;
      var results_size = result.length;

      var results = new Array;
      for( var idx = 0; idx != results_size; ++idx ) {
        if(result[idx].JobStatus == "2") {
          results.push(result[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: null,
        field_jobs: results,
        drafting_jobs: null,
        review_jobs: null,
        completed_jobs: null,
      };

      res.render('status', page_params);
    }
  });

});

router.get('/status/drafting', function(req, res) {

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "3" } },
    callback: function(output) {

      var result = output.result;
      var results_size = result.length;

      var results = new Array;
      for( var idx = 0; idx != results_size; ++idx ) {
        if(result[idx].JobStatus == "3") {
          results.push(result[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: null,
        field_jobs: null,
        drafting_jobs: results,
        review_jobs: null,
        completed_jobs: null,
      };

      res.render('status', page_params);
    }
  });

});

router.get('/status/review', function(req, res) {

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "4" } },
    callback: function(output) {

      var result = output.result;
      var results_size = result.length;

      var results = new Array;
      for( var idx = 0; idx != results_size; ++idx ) {
        if(result[idx].JobStatus == "4") {
          results.push(result[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: null,
        field_jobs: null,
        drafting_jobs: null,
        review_jobs: results,
        completed_jobs: null
      };

      res.render('status', page_params);
    }
  });

});

router.get('/status/completed', function(req, res) {

  rpcJs.input({
    input: { method: 'list_job_status', params: { status: "6" } },
    callback: function(output) {

      var result = output.result;
      var results_size = result.length;

      var results = new Array;
      for( var idx = 0; idx != results_size; ++idx ) {
        if(result[idx].JobStatus == "6") {
          results.push(result[idx]);
        }
      }

      var page_params = {
        title: 'Job Status',
        ordered_jobs: null,
        field_jobs: null,
        drafting_jobs: null,
        review_jobs: null,
        completed_jobs: results
      };

      res.render('status', page_params);
    }
  });

});

module.exports = router;
