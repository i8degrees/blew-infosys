var express = require('express');
var router = express.Router();

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
  req.session.destroy();
  console.log("session:", req.session);

  res.redirect('/index');
});

router.get('/sess', function(req, res, next) {
  console.log("session:", req.session);

  res.redirect('/index');
});

module.exports = router;
