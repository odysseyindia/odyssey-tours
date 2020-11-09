const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs') 
const yaml = require('js-yaml')
var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1313');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/ajax',function (req, res) {
  
  	const 	dir 	= "/home/alfred/webapps/odyssey-tours/content/english"
  	let 	file 	= dir + req.body.file + '_index.md'
	let   newData = req.body.data

	console.table( req.body.data )
	console.log( 'req.body.data' )

	try {
	    const fileContents = fs.readFileSync(file+'.orig', 'utf8');
		let data = yaml.safeLoadAll(fileContents);

		console.table( data[0].itinerary )
		console.log( 'data' )

	    data[0].itinerary =  data[0].itinerary;

    	let output = `---\n` + yaml.safeDump(data[0]) + "---\n" + data[1]

		fs.writeFileSync(file, output, 'utf8', (err) => {       
        	if (err) throw err; 
        	console.log(err)
  	    }) 

	} catch (e) {
	    console.log(e);
	} 

    res.setHeader('Content-Type', 'application/json');
    res.end( 'test' );
});

app.listen(1314, function () {
  console.log('POST server is running on port 1314');
});


