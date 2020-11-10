const express 		= require('express')
const bodyParser 	= require('body-parser');
const fs 			= require('fs') 
const yaml 			= require('js-yaml')
var   app 			= express()

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

app.listen(1314, function () {
  console.log('POST server is running on port 1314');
});


