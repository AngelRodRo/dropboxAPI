var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function generateRedirectURI(req) {
   return url.format({
       protocol: req.protocol,
       host: req.headers.host,
       pathname: app.path() + '/success'
   });
}

module.exports = router;
