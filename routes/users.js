var express = require('express');
var router = express.Router();
var app = express();

var rpc = require('rpc.js');
var rpcJs = rpc.gateway( { schema: require('../models/rpc') } );
// var assert = require('assert');

/* GET users listing. */
router.get('/', function(req, res, next) {
  next();
});

router.get('/login', function(req, res, next) {
  req.session.user = 'blew';
  req.session.pass = 'boobies!';

  console.log("session:", req.session);

  res.render('login', {});
});

router.get('/logout', function(req, res, next) {
  req.session.destroy( function(err) {
  });

  res.redirect('/index');
});

router.get('/sess', function(req, res, next) {
  console.log("session:", req.session);

  res.redirect('/index');
});

module.exports = router;
