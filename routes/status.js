var express = require('express');
var router = express.Router();
var app = express();

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../lib/api') } );

var assert = require("assert");

// TODO(jeff): validation of fields!!

router.get('/', function(req, res) {

  rpcJs.input({
    input: { method: 'list_pr', params: {} },
    callback: function(output) {

      var jobs_null = [];
      var fieldwork = [];
      var drafting = [];
      var review = [];
      var completed = [];
      var unassigned = [];

      var result = output.result;
      for( var idx = 0; idx != result.length; ++idx ) {

        var job = result[idx];
        var sresult = job.JobStatus;

        if(sresult === 'fieldwork') {
          fieldwork.push(job);
        } else if(sresult === 'drafting') {
          drafting.push(job);
        } else if(sresult === 'review') {
          review.push(job);
        } else if(sresult === 'completed') {
          completed.push(job);
        } else if(sresult === 'not assigned') {
          unassigned.push(job);
        }
      }

      var page_params = {
        results: [
          {
            desc: 'Jobs in the field:',
            type: 'fieldwork',
            jobs: fieldwork
          },
          {
            desc: 'Jobs in drafting:',
            type: 'drafting',
            jobs: drafting,
          },
          {
            desc: 'Jobs up for review:',
            type: 'review',
            jobs: review,
          },
          {
            desc: 'Completed jobs:',
            type: 'completed',
            jobs: completed,
          },
          {
            desc: 'unassigned:',
            type: null,
            jobs: unassigned,
          }
        ],
      };

      res.render('status', page_params);
    }
  });
});

// 'not assigned'
router.get('/unassigned', function(req, res, next) {

  rpcJs.input({
    input: { method: 'list_pr', params: {} },
    callback: function(output) {

      var result = output.result;
      var results = [];
      for( var idx = 0; idx != result.length; ++idx ) {
        if(result[idx].JobStatus === 'not assigned') {
          results.push(result[idx]);
        }
      }

      var page_params = {
        results: [{
          desc: 'Jobs without assigned status:',
          type: null,
          jobs: results
        }]
      };

      res.render('status', page_params);
    }
  });
});

router.get('/assigned', function(req, res, next) {

  rpcJs.input({
    input: { method: 'list_pr', params: {} },
    callback: function(output) {

      var results = [];
      var result = output.result;
      for( var idx = 0; idx != result.length; ++idx ) {

        if(result[idx].JobStatus != 0 &&
           result[idx].JobStatus != 'not assigned')
        {
          console.log();
          results.push(result[idx]);
        }
      }

      var page_params = {
        results: [{
          desc: 'Assigned Jobs',
          type: null,
          jobs: results
        }]
      };

      res.render('status', page_params);
    }
  });
});

router.get('/:job_status', function(req, res) {
  var job_status = req.params.job_status;
  status_query = job_status.toLowerCase();

  rpcJs.input({
    input: { method: 'list_pr', params: { status: status_query } },
    callback: function(output) {

      var page_params = { results: [] };
      page_params.results.push({
        desc: null,
        type: status_query,
        jobs: output.result
      });

      res.render('status', page_params);
    }
  });
});

module.exports = router;
