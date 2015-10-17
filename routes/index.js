var express = require('express');
var router = express.Router();
var url = require('url');
var crypto = require('crypto');
var app = express();
var request = require('request');
var fs = require('fs');
var session = require('express-session');

var APP_KEY = "awmzvqivixu65rc";
var APP_SECRET = "dpszqqo9h34gj3z";

/* GET home page. */
router.get('/', function(req, res, next) {
   var csrfToken = generateCSRFToken();
   console.log('redireccionando...');
   console.log(app.path());
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

       if (data.error) {
           return res.send('ERROR: ' + data.error);
       }

       req.session.token=data.access_token;

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

router.get('/uploadfile', function (req, res) {
   var serverpath="/";//file to be save at what path in server
   var localpath="/home/colaborador/Documentos/textoplano.txt";//path of the file which is to be uploaded
   if (req.query.error) {
       return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
   }
   fs.readFile(localpath,'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        console.log(content);
        fileupload(req.session.oauth,content);
    });
});

function fileupload(token,content){
    request.put('https://api-content.dropbox.com/1/files_put/auto/'+serverpath, {
    headers:
    { Authorization: 'Bearer ' + token ,
      'Content-Type': 'text/plain',
      body:content
   }
},
    function optionalCallback (err, httpResponse, bodymsg) {
    if (err) {
        console.log(err);
    }
    else
    {
        console.log(bodymsg);
    }
});
}

module.exports = router;
