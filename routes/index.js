var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'blew infosys' } );
});

router.get('/index', function(req, res) {
  res.render('index', { title: 'blew infosys' } );
});

module.exports = router;
