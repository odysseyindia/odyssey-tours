var   express 		= require('express');
var   cors        = require('cors');
var   bodyParser  = require('body-parser');
const mkdirp      = require('mkdirp');
const fs 			    = require('fs'); 
var   getDirName  = require('path').dirname;
const yaml 			  = require('js-yaml');
var   app 			  = express();
const port        = 1314;
const root        = "/home/alfred/webapps/odyssey-tours/"
const dir         = root+"content/english";

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


app.post('/import',function (req, res) {

  const readline = require('readline');
  var request    = JSON.parse(req.body.data);
  var file       = root + request.file;

  console.log('Reading '+file);

  // states:
  // select state,oneliner, writeup,states_id from states
  // cities:
  // select city, cities.writeUp, DefaultDays, cities.longitude,cities.latitude, cities.display, state from cities join states on cities.states_id=states.states_id join states s on s.states_id=cities.states_id where cities.display=1
  // hotels
  // Select s.state, city, organisation,a.addressbook_id, postalcode,h.description,h.starcategories_id, h.rooms from addressbook a join hotels h on a.addressbook_id=h.addressbook_id join states s on s.states_id = a.states_id where web=1
  // Services:
  // select states.state, c.city, description,duration,starttime,tt.transfer,tt.transfercode,active,daysofoperation,tc.city, to_cities_id,owntransport,guide from services s join cities c on c.cities_id=s.cities_id join states on states.states_id=c.states_id left join cities tc on tc.cities_id=s.to_cities_id left join transfertypes tt on tt.transfertypes_id = s.transfertypes_id where active=1


  const readInterface = readline.createInterface({
        input: fs.createReadStream(file),
        // output: process.stdout,
        console: false
  });

  var lineno = 0;

// replace possible errors in the database output
// readInterface.replace(/,,,,,\n+/g,'');

  readInterface.on('line', function (line) {

    lineno++;


    var lineArray = CSVToArray(line);
    var array = lineArray[0];
   
    // console.log(array);

    if ( request.file == 'cities.csv'){
    var city   = array[0];
        city   = city.trim().toString().replace(/ +/g,'-').toLowerCase();
    var state  = array[6];

    if (typeof state === "undefined") throw "state for "+city+" is undefined";

    state = state.replace(/ +/g,'-').toLowerCase(); 

    var mdfile = dir+'/states/'+state+'/cities/'+city+'/';

    console.log('Processing ',mdfile);

    const made = mkdirp.sync(mdfile);

     try {

      frontMatter = {};

      frontMatter.title           = array[0];
      frontMatter.translationKey  = city;
      frontMatter.defaultDays     = Number(array[2]) || 0;
      frontMatter.latitude        = Number(array[3]) || '';
      frontMatter.longitude       = Number(array[4]) || '';
      frontMatter.draft           = (array[5]==1) ? false : true; // web
      frontMatter.id              = 'city';
      frontMatter.type            = 'city';
      frontMatter.tags            = ['Cities',array[0] ];

      let output = `---\n` 
      + yaml.safeDump(frontMatter) 
      + "---\n" 
      + array[1]

      var test = yaml.safeDump( frontMatter );
      if (typeof test === "undefined"){
        console.log(city+' has an issue');
        console.table( array );
      } else {
        // console.table( output );
        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      }; 
    } catch (error) {
      console.log("Route import writing "+city+": " + error.message);
    }

  } else if ( request.file == 'states.csv') {

    var state     = array[0];
        state     = state.trim().toString().replace(/ +/g,'-').toLowerCase();
    var oneliner  = array[1];
    var writeup   = array[2];
    var states_id = array[3];

    var mdfile = dir+'/states/'+state+'/';

    console.log('Processing ',mdfile);

    const made = mkdirp.sync(mdfile);

     try {

      frontMatter = {};

      frontMatter.title           = array[0];
      frontMatter.translationKey  = state;
      frontMatter.oneliner        = array[1] || '';
      frontMatter.states_id       = Number(array[3]) || '';
      frontMatter.draft           = (array[5]==1) ? false : true; // web
      frontMatter.id              = 'state';
      frontMatter.type            = 'state';
      frontMatter.tags            = ['States',array[0] ];

      let output = `---\n` 
      + yaml.safeDump(frontMatter) 
      + "---\n" 
      + (array[2] == 'NULL' ? '' : array[2]);

      // console.table( output );
      fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
        if (err) throw err; 
      })
 
    } catch (error) {
      console.log("Route import writing "+state+": " + error.message);
    } 
    
  } else if ( request.file == 'hotels.csv') {

   // state city  organisation  addressbook_id  postalcode  description starcategories_id rooms

    var state             = array[0];
        state             = state.trim().toString().replace(/ +/g,'-').toLowerCase();
    var city              = array[1];
        city              = city.trim().toString().replace(/ +/g,'-').toLowerCase();
    var organisation      = array[2];
        organisation      = organisation.trim().toString().replace(/ +/g,'-').toLowerCase();

    var mdfile = dir+'/states/'+state+'/cities/'+city+'/hotels/'+organisation+'/';

    console.log('Processing ',mdfile);

    const made = mkdirp.sync(mdfile);

     try {

      frontMatter                 = {};
      frontMatter.title           = array[2];
      frontMatter.translationKey  = organisation;
      frontMatter.addressbook_id  = Number(array[3]) || '';
      frontMatter.postalcode      = Number(array[4]) || '';
      frontMatter.starcategories_id  = Number(array[6]) || '';
      frontMatter.rooms           = Number(array[7]) || '';
      frontMatter.draft           = false;
      frontMatter.id              = 'hotel';
      frontMatter.type            = 'hotels';
      frontMatter.tags            = ['Hotels',array[2] ];

      let output = `---\n` 
      + yaml.safeDump(frontMatter) 
      + "---\n" 
      + (array[5] == 'NULL' ? '' : array[5]);

      // console.table( output );
      fs.writeFileSync(mdfile+'index.md', output, 'utf8', (err) => {       
        if (err) throw err; 
      })
 
    } catch (error) {
      console.log("Route import writing "+state+": " + error.message);
    } 
  } else if ( request.file == 'services.csv') {

   // state  city  description duration  starttime transfer  transfercode  active  daysofoperation city  to_cities_id  owntransport  guide

    var state             = array[0];
        state             = state.trim().toString().replace(/ +/g,'-').toLowerCase();
    var city              = array[1];
        city              = city.trim().toString().replace(/ +/g,'-').toLowerCase();
    var description       = array[2];
        description       = organisation.trim().toString().replace(/ +/g,'-').toLowerCase();

    var mdfile = dir+'/states/'+state+'/cities/'+city+'/excursions/'+description+'/';

    console.log('Processing ',mdfile);

    const made = mkdirp.sync(mdfile);

     try {

      frontMatter                 = {};
      frontMatter.title           = array[2];
      frontMatter.translationKey  = description;
      frontMatter.duration        = array[3] || '';
      frontMatter.startTime       = array[4] || '';
      frontMatter.transfer        = (array[5] == 'NULL') ?  '' : array[5];
      frontMatter.transferCode    = (array[6] == 'NULL') ?  '' : array[6];
      frontMatter.draft           = (array[7] == 1) ?  true : false; // active
      frontMatter.daysOfOperation = (array[8] == 'NULL') ?  '' : array[8];
      frontMatter.toCity          = (array[9] == 'NULL') ?  '' : array[9];
      frontMatter.owntransport    = (array[10] == 1) ?  true : false;
      frontMatter.guide           = (array[11] == 1) ?  true : false;
      frontMatter.id              = 'services';
      frontMatter.type            = 'services';
      frontMatter.tags            = ['Services',array[2] ];

      let output = `---\n` 
      + yaml.safeDump(frontMatter) 
      + "---\n" 
      // + array[5]
      ;

      // console.table( output );
      fs.writeFileSync(mdfile+'index.md', output, 'utf8', (err) => {       
        if (err) throw err; 
      })
 
    } catch (error) {
      console.log("Route import writing "+state+": " + error.message);
    } 
    } else  {
      console.log(file+" is a wrong option");
    }

  });

    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }

});


app.post('/ajax',function (req, res) {

 var request = JSON.parse(req.body.data);
 var file    = dir + request.file + '_index.md';
console.log('Reading '+file);
 try {
   var fileContents = fs.readFileSync(file, 'utf8', (err) => {       
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
  var path    = dir + request.file + 'index.md';

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


app.post('/geolocation',function (req, res) {

  const fs = require('fs'); 
  const fetch = require('node-fetch');
  const Bluebird = require('bluebird');
 
  fetch.Promise = Bluebird;

  


  const nodeGeocoder = require("node-geocoder");
  require('dotenv').config();
  // console.log( process.env );

  const API_KEY = process.env.googleAPI;

  var request = JSON.parse(req.body.data);
  var address = request.address;

  const options = {
    provider: 'google',
    // Optional depending on the providers
    fetch: 'JSON',
    apiKey: API_KEY, 
    formatter: null // 'gpx', 'string', ...
  };

  let geoCoder = nodeGeocoder(options);

const { promisify } = require('util');
const sleep = promisify(setTimeout);

// console.log("address=",address);

  try {
   var dataStr = fs.readFileSync('CityArray.txt', 'utf8', (err) => {       
     if (err) throw err; }) 
  } 
  catch (error) {
    console.log('Route geolocation: ' + error.message);
  } 

  var dataArray = dataStr.split(",");
  var lines = "";

// dataArray.length

  for (var i = 0, len = 3; i < len; i++) {
    
    sleep(6000).then(() => {

      console.log( dataArray[i] );

      let url = "https://maps.googleapis.com/maps/api/geocode/json?address='"+dataArray[i]+"'&key="+API_KEY;
      // geoCoder.geocode(dataArray[i])

      const body = { a: 1 };
       
      fetch(url, {
              method: 'post',
              body:    JSON.stringify(body),
              headers: { 'Content-Type': 'application/json' },
          })
          .then(res => res.json())
          .then(json => console.log(json));
            
          });
          
        }; 

      fs.writeFileSync('CityArray.csv', lines, 'utf8', (err) => {  
        if (err) throw err; 
    });
 
});



app.get('/', function(req, res){ 
  res.send({ title: 'Welcome to Odyssey Tours',test:'Success, the server is running' }); 
}); 

app.listen(port, function(err){ 
  if (err) console.log(err); 
  console.log("Server listening on port ", port); 
}); 