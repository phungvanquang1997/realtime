var express = require('express');
var router = express.Router();
let ejs = require('ejs');

/* GET home page. */
router.get('/chat-room', function(req, res, next) {
  res.render('chat', {
    user_name: req.query.user_name
  });
});

router.get('/', function(req, res, next) {
  res.render('login');
});

module.exports = router;
