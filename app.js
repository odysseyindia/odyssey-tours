var   express 		= require('express');
var   cors        = require('cors');
var   bodyParser  = require('body-parser');
const mkdirp      = require('mkdirp');
const fs 			    = require('fs'); 
var   getDirName  = require('path').dirname;
const yaml 			  = require('js-yaml');
const env         = require('dotenv').config();
var   copydir     = require('copy-dir');
var   app 			  = express();
const port        = 1314;
const root        = process.env.hugoRoot; 
const dir         = root+"content/english";

function urlize(url){
 
  data = url.trim()
  .toString()
  .toLowerCase()
  .replace(/[ ]/g, '-')
  .replace(/[']/g, '')
  .replace(/[&]/g, 'and')
  .replace(/[\/\\@_#,+()$%.":*?<>{}]/g, '')
  .replace(/[-]+/g, '-');

  return data;
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*' );
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
  // select state, oneliner, writeup, states_id, web from states where web=1
  // cities:
  // select city, cities.writeUp, DefaultDays, cities.longitude,cities.latitude, cities.display, state from cities join states on cities.states_id=states.states_id join states s on s.states_id=cities.states_id where cities.display=1
  // hotels
  // Select s.state, city, organisation,a.addressbook_id, postalcode,h.description,h.starcategories_id, h.rooms from addressbook a join hotels h on a.addressbook_id=h.addressbook_id join states s on s.states_id = a.states_id where web=1
  // Services:
  // select states.state, c.city, description,duration,starttime,tt.transfer,tt.transfercode,active,daysofoperation,tc.city, to_cities_id,owntransport,guide from services s join cities c on c.cities_id=s.cities_id join states on states.states_id=c.states_id left join cities tc on tc.cities_id=s.to_cities_id left join transfertypes tt on tt.transfertypes_id = s.transfertypes_id where active=1


  const readInterface = readline.createInterface({
    input: fs.createReadStream(file),
    console: false
  });

  var lineno = 0;

  // replace possible errors in the database output
  // readInterface.replace(/,,,,,\n+/g,'');

  readInterface.on('line', function (line) {

    lineno++;

    var lineArray = CSVToArray(line);
    var array     = lineArray[0];

    if ( request.file == 'cities.csv'){
      var city   = urlize(array[0]);
      var state  = urlize(array[1]);
      var country= urlize(array[2]);

      var mdfile = dir+'/destinations/'+country;

      if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
      };
      
      mdfile += '/cities/'+city+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {

        frontMatter = {};

        var display   = Number(array[8]) || 0;
        var nighthalt = Number(array[7]) || 0;

        // 0=city, 1=state,2=country,3=writeUp,4=DefaultDays,5=longitude,6=latitude,7=nighthalt, 8=display, 9=alias
          
        frontMatter.title           = array[0];
        frontMatter.translationKey  = city;
        frontMatter.defaultDays     = Number(array[4]) || 0;
        frontMatter.longitude       = Number(array[5]) || '';
        frontMatter.latitude        = Number(array[6]) || '';
        frontMatter.alias           = (array[9] == 'NULL') ? '' : array[9];
        frontMatter.draft           = (web==0) ? true : false; 
        frontMatter.nighthalt       = (nighthalt==1) ? true : false;
        frontMatter.display         = (display==1) ? true : false; 
        frontMatter.id              = 'city';
        frontMatter.type            = 'city';
        frontMatter.tags            = ['Cities',array[0].replace(/[.]/g, '') ];

        let output = `---\n` 
        + yaml.dump(frontMatter) 
        + "---\n" 
        + array[3].replace(/[`]/g, "'");

        var test = yaml.dump( frontMatter );
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

    } else if ( request.file == 'carhire.csv') {

      /*
      0=state,1=service_city,city,3=organisation,carhire_id,addressbook_id,6=vehicles_id,7=frompax,8=topax,9=wef,10=wet,costnonac,12=costac,
      fit,remarks,costpertour,16=costperkmac,costperkmnonac,18=minimumkm,costinterstate,20=costnighthalt,coststatetax,
      commission,masters_id,currencies_id,25=TollTax,ServiceCities_id,27=CostEscort, 28=vehicle
      */
      var state     = urlize(array[0]);
      var city      = urlize(array[1]);
      
      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/carhire/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);


      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

    //    data[0] = {};
        data[0].title           = array[3];
        data[0].translationKey  = urlize(array[3]);
        data[0].type            = 'carhire';

        var ratesData = {};
        ratesData.vehicle         = array[28];
        ratesData.fromPax         = Number(array[7]) || 0;
        ratesData.toPax           = Number(array[8]) || 0;
        ratesData.wef             = (array[9]); 
        ratesData.wet             = (array[10]);
        ratesData.cost            = Number(array[12]) || 0;
        ratesData.tollTax         = Number(array[25]) || 0;
        ratesData.escort          = Number(array[27]) || 0;
        
        if (typeof data[0].rates === 'undefined'){
          data[0].rates = [];
        };

        // reset rates to null
    //    data[0].rates = []; 
        data[0].rates.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 

 } else if ( request.file == 'point2point.csv') {

      /*
     0=state
     1=city
     2=organisation
     4=to_city
     5=vehicle
     6=frompax
     7=topax
     8=wef
     9=wet
     11=costac
     12=currencies_id
     13=commission
     14=rep
     15=guide

      */
      var state        = urlize(array[0]);
      var city         = urlize(array[1]);
      var to_city      = urlize(array[4]);
      var organisation = urlize(array[2]);
      
      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/point2point/'+to_city+'/'+organisation+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);


      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

    //    data[0] = {};
        data[0].title           = array[2];
        data[0].translationKey  = urlize(array[2]);
        data[0].type            = 'point2point';

        var ratesData = {};
        ratesData.vehicle         = array[28];
        ratesData.fromPax         = Number(array[6]) || 0;
        ratesData.toPax           = Number(array[7]) || 0;
        ratesData.wef             = (array[8]); 
        ratesData.wet             = (array[9]);
        ratesData.cost            = Number(array[11]) || 0;
        ratesData.currency        = (array[12] == 13) ? 'INR' : array(12);
        ratesData.commission      = Number(array[13]) || 0;
        ratesData.rep             = Number(array[14]) || 0;
        ratesData.guide           = Number(array[15]) || 0;
        
        if (typeof data[0].rates === 'undefined'){
          data[0].rates = [];
        };

        // reset rates to null
     // data[0].rates = []; 
        data[0].rates.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 

   } else if ( request.file == 'costservices-entrance.csv') {

      /*
      0=state,1=city,2=organisation,3=description,costservices_id,addressbook_id,services_id,7=wef,8=remarks,tourleaderfree,
      10=servicecharges,11=agentcharges,12=commissionontransport,cities_id,costservicesdistinct_id,costservicesentrancefees_id,costservices_id,
      17=frompax,18=topax,19=cost,tourleaderfree,21=remarks,22=currencies_id,23=resident,SpecialGst,nett
       */
      var state     = urlize(array[0]);
      var city      = urlize(array[1]);
      
      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/excursions/'+urlize(array[3])+'/'+urlize(array[2])+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);
     

      try {
        var fileContents = fs.readFileSyncgiy(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        data[0].title           = array[2];
        data[0].translationKey  = urlize(array[2]);
        data[0].type            = 'costservices';

        var ratesData = {};
        ratesData.wef             = array[7]; 
        ratesData.wet             = '';
        ratesData.serviceCharges  = Number(array[10]) || 0;
        ratesData.agentCharges    = Number(array[11]) || 0;
        ratesData.commissionOnTransport  = Number(array[12]) || 0;
        ratesData.fromPax         = Number(array[17]) || 0;
        ratesData.toPax           = Number(array[18]) || 0;
        ratesData.cost            = Number(array[19]) || 0;
        ratesData.remarks         = array[21];
        ratesData.currency        = (array[22] == 13) ? 'INR' : array(22);
        ratesData.resident        = array[23];
        ratesData.gst             = array[24];
        ratesData.nett            = array[25];

        if (typeof data[0].entranceFees === 'undefined'){
          data[0].entranceFees = [];
        };

        // reset rates to null
        // data[0].entranceFees = []; 
        data[0].entranceFees.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[8] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
 } else if ( request.file == 'costservices-guides.csv') {

      /*
     0=state,1=city,2=organisation,3=description,costservices_id,addressbook_id,services_id,
     7=wef,8=remarks,tourleaderfree,10=servicecharges,11=agentcharges,12=commissionontransport,cities_id,costservicesdistinct_id,
     costservicesguides_id,costservices_id,17=frompax,18=topax,19=cost,tourleaderfree,21=remarks,22=currencies_id,23=resident,24=SpecialGst,25=nett
  */
      var state     = urlize(array[0]);
      var city      = urlize(array[1]);
      
      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/excursions/'+urlize(array[3])+'/'+urlize(array[2])+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);
     

      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);
console.table(data);
        data = {};
        data.title           = array[2];
        data.translationKey  = urlize(array[2]);
        data.type            = 'costservices';

        var ratesData = {};
        ratesData.wef             = array[7]; 
        ratesData.wet             = '';
        ratesData.serviceCharges  = Number(array[10]) || 0;
        ratesData.agentCharges    = Number(array[11]) || 0;
        ratesData.commissionOnTransport  = Number(array[12]) || 0;
        ratesData.fromPax         = Number(array[17]) || 0;
        ratesData.toPax           = Number(array[18]) || 0;
        ratesData.cost            = Number(array[19]) || 0;
        ratesData.remarks         = array[21];
        ratesData.currency        = (array[22] == 13) ? 'INR' : array(22);
        ratesData.resident        = array[23];
        ratesData.gst             = array[24];
        ratesData.nett            = array[25];
        
        if (typeof data.guides === 'undefined'){
          data.guides = [];
        };

        // reset rates to null
        // data[0].guides = []; 
        data.guides.push( ratesData );
console.table(data)
        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[8] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 

    } else if ( request.file == 'states.csv') {

      var state     = urlize(array[0]);
      var oneliner  = array[1];
      var writeup   = array[2];
      var states_id = array[3];

      var mdfile = dir+'/destinations/india/states/'+state+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {

        var web = Number(array[5]) || 0;

        frontMatter = {};

        frontMatter.title           = array[0];
        frontMatter.translationKey  = state;
        frontMatter.oneliner        = array[1] || '';
        frontMatter.states_id       = Number(array[3]) || '';
        frontMatter.draft           = (web==0) ? true : false; 
        frontMatter.id              = 'state';
        frontMatter.type            = 'state';
        frontMatter.tags            = ['States',array[0].replace(/[.]/g, '') ];

        let output = `---\n`+yaml.dump(frontMatter)+"---\n"+(array[2] == 'NULL' ? '' : array[2].replace(/[`]/g, "'"));

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })

      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
    } else if ( request.file == 'hotels.csv') {

      // state city  organisation  addressbook_id  postalcode  description starcategories_id rooms

      var state             = urlize(array[0]);
      var city              = urlize(array[1]);
      var organisation      = urlize(array[2]);

      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/hotels/'+organisation+'/';

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
        frontMatter.tags            = ['Hotels',array[2].replace(/[.]/g, '') ];
        frontMatter.category        = array[8];

        let output = `---\n` 
        + yaml.dump(frontMatter) 
        + "---\n" 
        + (array[5] == 'NULL' ? '' : array[5].replace(/[`]/g, "'"));

        fs.writeFileSync(mdfile+'index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })

      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
    } else if ( request.file == 'services.csv') {

      // 0=state  1=city  2=description 3=duration 4=starttime 5=transfer  6=transfercode  7=active  8=daysofoperation 
      // 9=city  10=to_cities_id  11=owntransport  12=guide  13=dayatleisure


      var state             = urlize(array[0]);
      var city              = urlize(array[1]);
      var description       = urlize(array[2]);

      var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/excursions/'+description+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {

        var web     = Number(array[7]) || 0;
        var writeup = array[13].trim().toString().replace(/[`]/g, "'");

        frontMatter                 = {};
        frontMatter.title           = array[2];
        frontMatter.translationKey  = description;
        frontMatter.duration        = array[3] || '';
        frontMatter.startTime       = (array[4] == 'NULL') ?  '' : array[4];
        frontMatter.transfer        = (array[5] == 'NULL') ?  false : true;
        frontMatter.transferCode    = (array[6] == 'NULL') ?  '' : array[6];
        frontMatter.draft           = (web == 0) ?  true : false; 
        frontMatter.daysOfOperation = (array[8] == 'NULL') ?  0  : Number(array[8]);
        frontMatter.toCity          = (array[9] == 'NULL') ?  '' : array[9];
        frontMatter.toCitiesId      = (array[10] == 'NULL') ?  '' : array[10];
        frontMatter.owntransport    = (array[11] == 1) ?  true : false;
        frontMatter.guide           = (array[12] == 1) ?  true : false;
        frontMatter.dayAtLeisure    = (array[13] == 1) ?  true : false;
        frontMatter.id              = 'services';
        frontMatter.type            = 'excursions';
        frontMatter.tags            = ['Services',array[2].replace(/[.]/g, '') ];

        let output = `---\n` + yaml.dump(frontMatter) + "---\n" + writeup;

        fs.writeFileSync(mdfile+'index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })

      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
    } else if ( request.file == 'airports.csv') {

      // 0=city,1=state,2=country,3=airportcode,4=airport

      var city   = urlize( array[0] );
      var state  = urlize( array[1] );
      var country= urlize( array[2] );

      var mdfile = dir+'/destinations/'+country;
      
      if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
      };
      
      mdfile += '/cities/'+city+'/_index.md';

      console.log('Processing ',mdfile);

      try {
        var fileContents = fs.readFileSync(mdfile, 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      } 

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

var airportData = array[3]+' '+array[4].replace(/[`]/g, "'");
console.log(airportData);

        if (typeof data[0].airports === 'undefined'){
          data[0].airports = [];
        };
        data[0].airports.push( airportData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2];
        fs.writeFileSync(mdfile, output, 'utf8', (err) => {       
          if (err) throw err; 
        }); 
      } 
      catch (error) {
        console.log('Route ajax writing: ' + error.message);
      } 
    
    } else if ( request.file == 'distances.csv') {

      // 0=from_city,1=from_state,2=country,3=to_city,4=to_state,5=distance,6=time,7=via,8=drive  

      var fromCity      = urlize(array[0]);
      var fromState     = urlize(array[1]);
      var fromCountry   = urlize(array[2]);

      var mdfile    = dir + '/destinations/' + fromCountry;
      var toState   = '';

      if (fromCountry == 'india'){ 
        if (typeof toState === "undefined") throw "state for "+ fromCity+" is undefined";
        mdfile   += '/states/'+ fromState;
        toState  += '/states/'+ urlize(array[4]) ; 
      } 

      mdfile += '/cities/'+fromCity+'/_index.md';

      console.log('Processing ',mdfile);

      try {
        var fileContents = fs.readFileSync(mdfile, 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        var distanceData        = {};
        distanceData.url        = '/destinations/'+fromCountry+toState+'/cities/'+urlize(array[3])+'/';
        distanceData.distance   = Number(array[5]);
        distanceData.time       = array[6];
        distanceData.via        = array[7];
        distanceData.driveable  = (array[8]) ? 1 : 0;

        if (typeof data[0].distances === 'undefined'){
          data[0].distances = [];
        };
        
        // reset distances to null
        // data[0].distances = []; 
        data[0].distances.push( distanceData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2];

        fs.writeFileSync(mdfile, output, 'utf8', (err) => {       
         if (err) throw err; 
        }) 
      } 
      catch (error) {
        console.log("Route import writing "+city+": " + error.message);
      } 
    } else {
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
  var file    = dir + request.file;
  console.log('Reading '+file);

  try {
    var fileContents = fs.readFileSync(file, 'utf8', (err) => {       
      if (err) throw err; 
    }) 
  } 
  catch (error) {
    console.log('Route ajax reading: ' + error.message);
  } 

  try {
    let contents       = fileContents.split("---");
    let data           = yaml.loadAll(contents[1]);
    let fm             = request.data[0];
    let oldData        = data[0];
    let newData        = {...oldData, ...fm };
    let output         = `---\n` + yaml.dump( newData ) + "---\n"; 
    output            += ( request.data[1].length > 0 ) ? request.data[1] : contents[2];

    fs.writeFile(file, output, function(err) {
      if(err) return console.error(err);
      console.log('Successfully wrote to the file!');
/*
      if (fm.region.length > 0){
        const fromFile = file.split('/');
        tourFile       = '/destinations/india/regions/'+fm.region+'/'+ fromFile[fromFile.length-2]; 
        
        copydir(file, tourFile, {utimes:false, mode:true, cover:false}, function(err){
        if(err) throw err;
          console.log('done');
        });
      };
*/
    });
  } 
  catch (error) {
    console.log('Route ajax writing: ' + error.message);
  } 
  res.end();
});


app.post('/copy',function (req, res) {

  var request = JSON.parse(req.body.data);
  var from    = dir + "/tim/itineraries/" +request.from;
  var to      = dir + "/tim/itineraries/" +request.to;

  copydir(from, to, {utimes:false, mode:true, cover:false
  }, function(err){
    if(err) throw err;
    console.log('done');
  });
});

app.post('/create',function (req, res) {

  var request = JSON.parse(req.body.data);
  var tour    = request.tour;
  var title   = request.title;
  var folder  = urlize(tour);
  var file    = dir + "/tim/itineraries/" + folder + '/_index.md'; 
  let output  = "---\ntitle: "+title+"\nsubtitle: \ntranslationKey: "+folder+"\ntype: itinerary\ntour: "+tour+"\nhighlights: \nitinerary: \n  - day: 0\n---\n" ;

  // console.log("file " ,file);

  mkdirp(getDirName(file)).then(made => {
    if (made == undefined){
      console.log('File exist already');  
    } else {
      console.log('Created a directory for ',folder);
      fs.writeFileSync(file, output, 'utf8', (err) => {       
        if (err) throw err; 
      });
    };
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
    let data = yaml.loadAll(fileContents);

    data[0].name       =  request.data.name;
    data[0].stage      =  request.data.stage;
    data[0].status     =  request.data.status;
    data[0].archived   =  request.data.archived;
    data[0].consultant =  request.data.consultant;
    data[0].arrdate    =  request.data.arrdate;
    data[0].depdate    =  request.data.depdate;

    let output = `---\n` + yaml.dump(data[0]) + "---\n" + data[1].replace(/[`]/g, "'");

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

  let output = `---\n` + yaml.dump(request.data[0]) + "---\n" + request.data[1].replace(/[`]/g, "'");

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

  require('dotenv').config();

  const fs      = require('fs'); 
  const fetch   = require('node-fetch');
  const API_KEY = process.env.googleAPI;
  var request   = JSON.parse(req.body.data);
  var address   = request.address;
  const options = {
    provider: 'google',
    fetch: 'JSON',
    apiKey: API_KEY, 
    formatter: null, 
  };

  try {
   var dataStr = fs.readFileSync('CityArray.txt', 'utf8', (err) => {       
     if (err) throw err; }) 
 } 
 catch (error) {
  console.log('Route geolocation: ' + error.message);
} 

var dataArray = dataStr.split(",");

console.log('array length is ',dataArray.length);

var i;
var len = dataArray.length;
var myAddress = [];

for (i = 0; i < len; i++) {

  let url = "https://maps.googleapis.com/maps/api/geocode/json?address='"+dataArray[i]+"'&key="+API_KEY;

  const body = { a: 1 };

  fetch(url, {
    method: 'post',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(function(json) { 

    for (j = 0; j < json.results.length; j++ ) {
      myAddress[i] = json.results[j].formatted_address+','+json.results[j].geometry.location.lat+','+json.results[j].geometry.location.lng;
      console.log( myAddress[i] );
      fs.writeFileSync('CityArray.csv', myAddress[i]+'\n', {flag:'a+'}, (err) => {  
        if (err) throw err; 
      });
    };

  });


};  
});


app.post('/geolocator',function (req, res) {

  require('dotenv').config();

  const fs      = require('fs'); 
  const fetch   = require('node-fetch');
  const API_KEY = process.env.googleAPI;
  var request   = JSON.parse(req.body.data);
  let url       = "https://maps.googleapis.com/maps/api/geocode/json?address='"+request.address+"'&key="+API_KEY;
  const body    = { a: 1 };
  const options = {
    provider: 'google',
    fetch: 'JSON',
    apiKey: API_KEY, 
    formatter: null, 
  };

  fetch(url, {
    method: 'post',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(function(json) { 

    for (j = 0; j < json.results.length; j++ ) {
      var myAddress = json.results[j].formatted_address+','+json.results[j].geometry.location.lat+','+json.results[j].geometry.location.lng;
      console.log( myAddress );
      fs.writeFileSync(dir+request.file, myAddress+'\n', (err) => {  
        if (err) throw err; 
      });
    };

  });  
});

app.get('/', function(req, res){ 
  res.send({ title: 'Welcome to Odyssey Tours',test:'Success, the server is running' }); 
}); 

app.listen(port, function(err){ 
  if (err) console.log(err); 
  console.log("Server listening on port ", port); 
}); 