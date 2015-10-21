var express = require('express');
var router = express.Router();
var app = express();
var Dropbox = require("dropbox");
var fs = require('fs');
//var Busboy = require('busboy');
//var multer  = require('multer')
//var upload = multer({ dest: 'uploads/' })

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var APP_KEY = "awmzvqivixu65rc";
var APP_SECRET = "dpszqqo9h34gj3z";
var APP_TOKEN = "uynxTRDzy2AAAAAAAAAApRV2ZNHJq4MbFwsAPQvdMOZBxPocd3nK21DEyy_EgUL0";

var client = new Dropbox.Client({
    key: APP_KEY,
    secret: APP_SECRET,
    token: APP_TOKEN
});

client.authDriver(new Dropbox.AuthDriver.NodeServer(8191));

router.get('/',function(req,res,next){
   res.render('index', { title: 'Hey', message: 'Hello there!'});

});

router.get('/account',function(req,res){
   getAccount(function(error){
      if(error)
         res.send('No se pudo recuperar la cuenta');
      else {
         res.send('Se pudo recupera la cuenta');
      }
   });
});

function getAccount(callback){
   client.getAccountInfo(function(error, accountInfo) {
      if (error) {
         callback(error);
         console.log(error);
      }
      else {
         console.log(accountInfo);
      }
   });

}



router.post('/uploadFile',multipartMiddleware,function(req,res){

   //var localpath = "/home/colaborador/Descargas/Introduccion.pdf";

   var path = req.files.displayImage.path;
   var name = req.files.displayImage.name;

   fs.readFile(req.files.displayImage.path, function(err, data){
      fileupload(name,data);
   });

   res.redirect('/dropbox');

})

function fileupload(name,content){
   client.writeFile(name,  content, function(error, stat) {
     if (error) {
         console.log(error);  // Something went wrong.
     }

     if(stat){
      console.log(stat);
      console.log("File saved as revision " + stat.versionTag);
    }

   });
}


module.exports = router;
