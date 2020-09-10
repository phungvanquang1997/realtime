var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.query.user_name);
  res.render('chat', {
    user_name: req.query.user_name
  });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;
