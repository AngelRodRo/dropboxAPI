var express = require('express');
var router = express.Router();
var node_dropbox = require('node-dropbox');
var app = express();
var consumer_key = "awmzvqivixu65rc";
var consumer_secret = "dpszqqo9h34gj3z";
var url = require('url');
var fs = require('fs');
var api = node_dropbox.api("uynxTRDzy2AAAAAAAAAAfe11RdpDjTJkIQr1jb2ulBLlus9RECdE3GPbEHTpvExG");


router.get('/', function(req, res, next) {
   api.account(function(err, res, body) {
       console.log(body);

   });
   res.send('Satisfactorio');

});

router.get('/createFolder',function(req,res,next){

   api.createDir('newfolder',function(error, response, body){
      if(body.error){
         console.log(body.error);
      }
      else {
         console.log('Exito al crear el folder');
      }
   });

   res.status(200);

});

router.get('/createFile',function(req,res,next){
   var localpath = "/home/colaborador/Descargas/Introduccion.pdf";
   fs.readFile(localpath, function(err, data){
      fileupload(data);
   });
});



function fileupload(contents){
   api.createFile('Introduccion.pdf', contents, function(error,response,body){
      if(error){
         console.log(error);
      }
      console.log(body);
   });
}

router.get('/delete',function(req,res,next){

   api.removeDir('newfolder',function(error, response, body){
      if(body.error){
         console.log(body.error);
      }
      else {
         console.log('Exito al eliminar el folder');
      }

   });

   res.status(200);

});



module.exports = router;
