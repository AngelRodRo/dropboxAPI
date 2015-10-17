var express = require('express');
var router = express.Router();
var url = require('url');
var crypto = require('crypto');
var app = express();
var request = require('request');

var APP_KEY = "awmzvqivixu65rc";
var APP_SECRET = "dpszqqo9h34gj3z";

/* GET home page. */
router.get('/', function(req, res, next) {
   var csrfToken = generateCSRFToken();
   console.log('redireccionando...');
   res.cookie('csrf', csrfToken);
   res.redirect(url.format({
         protocol: 'http',
         hostname: 'www.dropbox.com',
         pathname: '1/oauth2/authorize',
         query: {
            client_id: APP_KEY,//App key of dropbox api
            response_type: 'code',
            state: csrfToken,
            redirect_uri: generateRedirectURI(req)
         }
      })
   );
});

router.get('/success', function (req, res) {

   console.log('Envio satisfactorio');

   if (req.query.error) {
       return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
   }

   if (req.query.state !== req.cookies.csrf) {
       return res.status(401).send(
           'CSRF token mismatch, possible cross-site request forgery attempt.'
       );
   }

   request.post('https://api.dropbox.com/1/oauth2/token', {
       form: {
           code: req.query.code,
           grant_type: 'authorization_code',
           redirect_uri: generateRedirectURI(req)
       },
       auth: {
           user: APP_KEY,
           pass: APP_SECRET
       }
   }, function (error, response, body) {
       var data = JSON.parse(body);

       console.log(data);

       if (data.error) {
           return res.send('ERROR: ' + data.error);
       }

       var token = data.access_token;
       //req.session.token=token;
       request.post('https://api.dropbox.com/1/account/info', {
           headers: { Authorization: 'Bearer ' + token }
       }, function (error, response, body) {
           res.send('Logged in successfully as ' + JSON.parse(body).display_name + '.');
       });

    });
})

function generateRedirectURI(req) {
   return url.format({
       protocol: req.protocol,
       host: req.headers.host,
       pathname: app.path() + '/success'
   });
}

function generateCSRFToken() {

   return crypto.randomBytes(18).toString('base64').replace(/\//g, '-').replace(/\+/g, '_')
}

module.exports = router;
