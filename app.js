const express 		= require('express');
const bodyParser 	= require('body-parser');
const mkdirp      = require('mkdirp');
const fs 			    = require('fs'); 
var   getDirName  = require('path').dirname;
const yaml 			  = require('js-yaml');
var   app 			  = express();
const port = 1314;
const dir = "/home/alfred/webapps/odyssey-tours/content/english";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1313');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.post('/ajax',function (req, res) {

 var 	  file 	  = dir + req.body.file + '_index.md';
 var   	newData = req.body.data;

 try {
   var fileContents = fs.readFileSync(file+'.orig', 'utf8', (err) => {       
     if (err) throw err; 
   }) 
 } catch (e) {
   console.log('read app= '+e.message);
 } 

 try {
  let data = yaml.safeLoadAll(fileContents);

  data[0].itinerary =  newData;

  let output = `---\n` + yaml.safeDump(data[0]) + "---\n" + data[1]

  fs.writeFileSync(file, output, 'utf8', (err) => {       
   if (err) throw err; 
 }) 
} catch (e) {
 console.log('write app= '+e.message);
} 
res.end();
});


app.post('/save',function (req, res) {

  var   file    = dir + req.body.file + '_index.md';
  var   newData = req.body.data;

  try {
    var fileContents = fs.readFileSync(file, 'utf8', (err) => {
      if (err) throw err; 
    }) 
  } catch (e) {
    console.log('read app= '+e.message);
  };

  try {
    let data = yaml.safeLoadAll(fileContents);

    data[0].name       =  newData.name;
    data[0].stage      =  newData.stage;
    data[0].status     =  newData.status;
    data[0].archived   =  newData.archived;
    data[0].consultant =  newData.consultant;
    data[0].arrdate    =  newData.arrdate;
    data[0].depdate    =  newData.depdate;

    let output = `---\n` + yaml.safeDump(data[0]) + "---\n" + data[1]

    fs.writeFileSync(file, output, 'utf8', (err) => {       
      if (err) throw err; 
    });
  } catch (e) {
    console.log('write app= '+e.message);
  } 
  res.end();
});

app.post('/edit',function (req, res) {

  var   path = dir + req.body.file + '/index.md';
  var   data = req.body.data;

	console.log('Editing '+path);

  mkdirp(getDirName(path)).then(made =>
  	console.log(`Created directories: ${made}`));

  let output = `---\n` + yaml.safeDump(data[0]) + "---\n" + data[1]

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





app.post('/pdf',function (req, res) {
  var fs      = require('fs');
  var pdf     = require('html-pdf');
  var html    = fs.readFileSync(req.body.url, 'utf8');
  var options = { format: 'A4' };

  pdf.create(html, options).toFile(req.body.filename+'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
});

app.get('/', function(req, res){ 
    res.send({ title: 'Welcome to Odyssey Tours',test:'Success, the server is running' }); 
}); 

app.listen(port, function(err){ 
    if (err) console.log(err); 
    console.log("Server listening on PORT", port); 
}); 

