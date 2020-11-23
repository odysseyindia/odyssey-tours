var express 		  = require('express');
var cors          = require('cors');
var bodyParser  	= require('body-parser');
const mkdirp      = require('mkdirp');
const fs 			    = require('fs'); 
var   getDirName  = require('path').dirname;
const yaml 			  = require('js-yaml');
var   app 			  = express();
const port = 1314;
const dir  = "/home/alfred/webapps/odyssey-tours/content/english";

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1313');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.post('/ajax',function (req, res) {

 var request = JSON.parse(req.body.data);
 var file    = dir + request.file + '_index.md';

 try {
   var fileContents = fs.readFileSync(file+'.orig', 'utf8', (err) => {       
     if (err) throw err; 
   }) 
 } catch (error) {
   console.log('Route /ajax reading: ' + error.message);
 } 

 try {
  let data = yaml.safeLoadAll(fileContents);

  data[0].itinerary =  request.data;

  let output = `---\n` 
  + yaml.safeDump(data[0]) 
  + "---\n" 
  + data[1]

  fs.writeFileSync(file, output, 'utf8', (err) => {       
   if (err) throw err; 
 }) 
} catch (error) {
  console.log('Route /ajax writing: ' + error.message);
} 
res.end();
});


app.post('/copy',function (req, res) {

  var request = JSON.parse(req.body.data);
  var from    = dir + "/tim/itineraries/" +request.from;
  var to      = dir + "/tim/itineraries/" +request.to;
  var copydir = require('copy-dir');
 
  copydir(from, to, {utimes:false, mode:true, cover:false
  }, function(err){
    if(err) throw err;
    console.log('done');
  });
});


app.post('/save',function (req, res) {

  var request = JSON.parse(req.body.data);
  var file    = dir + request.file + '_index.md';

  try {
    var fileContents = fs.readFileSync(file, 'utf8', (err) => {
      if (err) throw err; 
    }) 
  } catch (error) {
    console.log('Route /save reading: ' + error.message);
  };

  try {
    let data = yaml.safeLoadAll(fileContents);

    data[0].name       =  request.data.name;
    data[0].stage      =  request.data.stage;
    data[0].status     =  request.data.status;
    data[0].archived   =  request.data.archived;
    data[0].consultant =  request.data.consultant;
    data[0].arrdate    =  request.data.arrdate;
    data[0].depdate    =  request.data.depdate;

    let output = `---\n` 
    + yaml.safeDump(data[0]) 
    + "---\n" 
    + data[1];

    fs.writeFileSync(file, output, 'utf8', (err) => {       
      if (err) throw err; 
    });
  } catch (error) {
    console.log('Route /save writing: ' + error.message);
  } 
  res.end();
});



app.post('/edit',function (req, res) {

  var request = JSON.parse(req.body.data);
  var path    = dir + request.file + '/index.md';

  console.log('Editing ' + path);

  mkdirp(getDirName(path)).then(made => {
    if (made == undefined){
      console.log('No need to create directories')  
    } else {
     console.log('Created directories')
   }
 });

  let output = `---\n` + yaml.safeDump(request.data[0]) + "---\n" + request.data[1]

  try {
   fs.writeFileSync(path, output, 'utf8', (err) => {       
     if (err) throw err; 
     console.log("File written successfully"); 
   });
 } catch(err) { 
  console.error(err); 
};

res.end();
});


app.get('/', function(req, res){ 
  res.send({ title: 'Welcome to Odyssey Tours',test:'Success, the server is running' }); 
}); 

app.listen(port, function(err){ 
  if (err) console.log(err); 
  console.log("Server listening on port ", port); 
}); 