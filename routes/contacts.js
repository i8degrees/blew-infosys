var express = require('express');
var router = express.Router();
var app = express();

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../models/rpc') } );
// var assert = require('assert');

// http://localhost:8888/api/contacts
router.get('/contacts', function(req, res) {

  var client_name = req.query['name'];
  var cid = req.query['cid'];

  // Test code
  // dbi.find_contact_by_id("C2003082661975500334", function callback(err, result, fields) {
  //   if( err ) {
  //     console.log("ERROR in find_contact_by_id function inside /contacts route");
  //   }

  //   var result_size = result.length;

  //   console.log("ClientKey result size:", result_size);
  //   for( var idx = 0; idx != result_size; ++idx ) {
  //     console.log("ClientKey (result):", result[idx].ClientKey);
  //   }

  //   console.log("Name (result):", result[0].Contact);
  // });

  rpcJs.input({
    input: { method: 'list_co', params: { cname: client_name, cid: cid } },
    callback: function(output) {

      var co_rows = output.result;
      res.render('contacts', { co_rows: output.result } );
    }
  });

});

// http://localhost:8888/api/contacts/C2003082661975500334
router.get('/contacts/:contact_id', function(req, res) {

  var client_name = req.query['name'];
  var cid = req.params.contact_id;
  // if( client_name != null ) {
  // }

  // Test code
  // dbi.find_contact_by_id("C2003082661975500334", function callback(err, result, fields) {
  //   if( err ) {
  //     console.log("ERROR in find_contact_by_id function inside /contacts route");
  //   }

  //   var result_size = result.length;

  //   console.log("ClientKey result size:", result_size);
  //   for( var idx = 0; idx != result_size; ++idx ) {
  //     console.log("ClientKey (result):", result[idx].ClientKey);
  //   }

  //   console.log("Name (result):", result[0].Contact);
  // });

  rpcJs.input({
    input: { method: 'list_co', params: { cid: cid } },
    callback: function(output) {

      var co_rows = output.result;
      res.render('contacts', { co_rows: output.result } );
    }
  });

});

module.exports = router;
