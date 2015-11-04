var express = require('express');
var router = express.Router();

// var rpc = require('rpc.js');
// var rpcJs = rpc.gateway( { schema: require('../lib/api') } );

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'blew infosys' } );
});

router.get('/index', function(req, res, next) {
  res.render('index', { title: 'blew infosys' } );
});

module.exports = router;
