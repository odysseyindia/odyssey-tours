const express 		= require('express')
const bodyParser 	= require('body-parser');
const fs 			    = require('fs') 
const yaml 			  = require('js-yaml')
var   app 			  = express()

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
  
  	const 	dir 	= "/home/alfred/webapps/odyssey-tours/content/english"
  	var 	file 	= dir + req.body.file + '_index.md'
	var   	newData = req.body.data

	try {
	    var fileContents = fs.readFileSync(file+'.orig', 'utf8', (err) => {       
        	if (err) throw err; 
  	    }) 
	} catch (e) {
	    console.log('read app= '+e.message)
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
  
  const dir     = "/home/alfred/webapps/odyssey-tours/content/english"
  var   file    = dir + req.body.file + '_index.md'
  var   newData = req.body.data

  try {
      var fileContents = fs.readFileSync(file, 'utf8', (err) => {       
          if (err) throw err; 
        }) 
  } catch (e) {
      console.log('read app= '+e.message)
  } 

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
        }) 
  } catch (e) {
      console.log('write app= '+e.message);
  } 
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


app.listen(1314, function () {
  console.log('POST server is running on port 1314');
});


