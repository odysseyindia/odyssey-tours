var   express 		= require('express');
var   cors        = require('cors');
var   bodyParser  = require('body-parser');
const mkdirp      = require('mkdirp');
const fs          = require('fs');
const fse         = require('fs-extra');
const spawn       = require('child_process'); 
var   getDirName  = require('path').dirname;
const yaml 			  = require('js-yaml');
const env         = require('dotenv').config();
//var   copydir     = require('copy-dir');
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

    } 

    else if ( request.file == 'suppliers.csv') {
      /*
      0=pan 1-gstin 2=addressbook_id  3=country 4=state 5=city  6=category  7=organisation  8=address 9=city  10=postalcode  
      11=areacode  12=phone 13=org_mobile  14=email 15=www 16=note  17=through_addressbook_id  18=currencycode  19=GstVendorTypes_id
      */

      var mdfile = dir+'/addressbook/'+Number(array[2])+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\ntype: suppliers\n---\n";
      }

      try {
        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        data[0] = {};
        data[0].title           = array[7];
        data[0].type            = 'suppliers';
        data[0].address         = array[8];
        data[0].city            = array[9];
        data[0].country         = array[3];
        data[0].postalCode      = array[10];
        data[0].areaCode        = array[11];
        data[0].phone           = array[12];
        data[0].mobile          = Number(array[13]);
        data[0].email           = array[14];
        data[0].www             = array[15];
        data[0].note            = array[16];
        data[0].bookThrough     = array[17];
        data[0].currency        = array[18];
        data[0].gstType         = array[19];
        let state = (urlize(array[4]).length > 0) ? urlize(array[4])+'/' : '';
        data[0].path            = '/'+urlize(array[3])+'/'+state+urlize(array[5])+'/';

        if (typeof data[0].category === 'undefined'){
          data[0].category = [];
        };

        // reset category to null
        // data[0].category = []; 
        data[0].category.push( array[6] );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
    }
    else if ( request.file == 'carhire.csv') {

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
    data[0].type            = '';

    var ratesData = {};
    ratesData.vehicle         = array[28];
    ratesData.fromPax         = Number(array[6]) || 0;
    ratesData.toPax           = Number(array[7]) || 0;
    ratesData.wef             = (array[8]); 
    ratesData.wet             = (array[9]);
    ratesData.cost            = Number(array[11]) || 0;
    ratesData.currency        = (array[12] == 13) ? 'INR' : array[12];
    ratesData.commission      = Number(array[13]) || 0;
    ratesData.rep             = Number(array[14]) || 0;
    ratesData.guide           = Number(array[15]) || 0;

    if (typeof data[0].rates === 'undefined'){
      data[0].rates = [];
    };

        // reset rates to null
      // data[0].rates = []; 
      // data[0].rates.push( ratesData );

      let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

      fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
        if (err) throw err; 
      })
    } catch (error) {
      console.log("Route import writing "+state+": " + error.message);
    } 

  } else if ( request.file == 'hotels.csv') {


  var country   = urlize(array[0]);
  var state     = urlize(array[1]);
  var city      = urlize(array[2]);

  var mdfile = dir+'/destinations/'+country;

      if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
      };
      
  mdfile += '/cities/'+city+'/hotels/'+urlize(array[3])+'/';

  console.log('Processing ',mdfile);

  const made = mkdirp.sync(mdfile);

  try {
    var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
      if (err) throw err; 
    }) 
  } 
  catch (error) {
    var fileContents = "---\n\n---\n";
    var data = [];
  }

/*
0=country 1-state 2-city  3=organisation  4-bookthrough 5=mailto  6=address 7=city  8=postalcode  
9=areacode  10=phone 11=org_mobile  12=email 13=www 14=web 15=showhotel 16=GstVendorTypes_id 
17=note  18=description 19=starcategories_id 20=checkout  
21-accessrail  22=accessair 23=accessbus 24=advantage 25=rooms
*/

let contents = fileContents.split("---");
var data = yaml.loadAll(contents[1]);

try {
  data[0]={};
  data[0].title         = array[3];
  data[0].translationKey = urlize(array[3]);
  data[0].type          = 'hotel';
  data[0].bookThrough   = array[4];
  data[0].mailTo        = array[5];
  data[0].address       = array[6];
  data[0].city          = array[7];
  data[0].postalcode    = array[8];
  data[0].phone         = array[9]+'-'+array[10]+','+array[11];
  data[0].gstType       = Number(array[16]);
  data[0].email         = array[12];
  data[0].www           = array[13];
  data[0].note          = array[17];
  data[0].web           = Number(array[14]);
  data[0].showHotel     = Number(array[15]);
  data[0].starCategory  = Number(array[19]);
  data[0].checkin       = '';
  data[0].checkout      = (array[20])? array[20] : '12:00';
  data[0].accessRail    = array[21];
  data[0].accessAir     = array[22];
  data[0].accessBus     = array[23];
  data[0].advantage     = array[24];
  data[0].rooms         = (array[25]) ? array[25] : 0;
  data[1]               = array[18].replace(/[`]/g, "'");

  let output = `---\n` + yaml.dump(data[0]) + "---\n" + data[1] ;

  fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
    if (err) throw err; 
  })
} catch (err) {
  console.log("Route import writing "+mdfile+": " + err.message);
} 


} else if ( request.file == 'hotelrates.csv') {

 var state     = urlize(array[0]);
 var city      = urlize(array[1]);
 var data      = [];
 data[0]   = {};

 var mdfile = dir+'/destinations/india/states/'+state+'/cities/'+city+'/hotels/'+urlize(array[2])+'/';

 console.log('Processing ',mdfile);

 const made = mkdirp.sync(mdfile);

 try {
  var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
    if (err) throw err; 
  }) 
  var contents = fileContents.split("---");
  data = yaml.loadAll(contents[1]);
} 
catch (error) {
  data[0].title           = array[2];
  data[0].translationKey  = urlize(array[2]);
  data[0].type            = 'hotel';
  data[0].id              = 'hotel';
}

    /*
    0=state 1=city  2=organisation  3=roomtype  4=default_roomtype  5=currency  6=currencyPT  7=mealplan  8=mealplanPT  
    9=cost_single 10=cost_single_pt  11=cost_single_ac  12=cost_single_ac_pt 
    13=cost_double 14=cost_double_pt  15=cost_double_ac  16=cost_double_ac_pt 
    17=nett  18=nett_pt 19=freetransfer  20=extrabed  21=extrabed_pt 
    22=fromdate  23=todate  24=frompax 25=to_pax  26=git 27=servicecharges  
    28=tac 29=tac_pt  30=taconmealplan 31=taconmealplan_pt  32=servicechargesonplan  33=closed  extrabedcost  
    35=dayoftheweek  extrabedpercentage  37=default_ac  38=SpecialPeriod 39=Notes 40=AgentCommPerc
    */

    try {
      var ratesData = {};
      ratesData.roomType             = array[3];
      ratesData.mealPlan             = array[7];
      ratesData.mealPlanPT           = array[8];
      ratesData.currency             = array[5];
      ratesData.currencyPT           = array[6];
      ratesData.costSingle           = Number(array[9])  || 0;
      ratesData.costSinglePT         = Number(array[10]) || 0;
      ratesData.costSingleAc         = Number(array[11]) || 0;
      ratesData.costSingleAcPT       = Number(array[12]) || 0;
      ratesData.costDouble           = Number(array[13]) || 0;
      ratesData.costDoublePT         = Number(array[14]) || 0;
      ratesData.costDoubleAc         = Number(array[15]) || 0;
      ratesData.costDoubleAcPT       = Number(array[16]) || 0;
      ratesData.nett                 = Number(array[17]) || 0;
      ratesData.nettPT               = Number(array[18]) || 0;
      ratesData.freeTransfer         = Number(array[19]) || 0;
      ratesData.extraBed             = Number(array[20]) || 0;
      ratesData.extraBedPT           = Number(array[21]) || 0;
      ratesData.wef                  = array[22]; 
      ratesData.wet                  = array[23];
      ratesData.fromPax              = Number(array[24]) || 0;
      ratesData.toPax                = Number(array[25]) || 0;
      ratesData.git                  = Number(array[26]) || 0;       
      ratesData.serviceCharges       = Number(array[27]) || 0;
      ratesData.commission           = Number(array[28]) || 0;
      ratesData.commissionPT         = Number(array[29]) || 0;
      ratesData.commissionOnPlan     = Number(array[30]) || 0;
      ratesData.commissionOnPlanPT   = Number(array[31]) || 0;
      ratesData.serviceChargesOnPlan = Number(array[32]) || 0;
      ratesData.blackout             = Number(array[33]) || 0;
      ratesData.dayOfTheWeek         = Number(array[35]) || 127;
      ratesData.defaultRoomType      = array[4];
      ratesData.defaultAc            = Number(array[37]) || 0;
      ratesData.specialPeriod        = Number(array[38]) || 0;
      ratesData.notes                = array[39] || 0;
      ratesData.agentCommission      = Number(array[40]) || 0;

      if (typeof data[0].rates === 'undefined'){
        data[0].rates = [];
      };

        // reset rates to null
        //data[0].rates = []; 
        data[0].rates.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (err) {
        console.log("Route import writing "+mdfile+": " + err.message);
      } 
    } else if ( request.file == 'hotel-contacts.csv') {

     var country   = urlize(array[0]);
     var state     = urlize(array[1]);
     var city      = urlize(array[2]);

     var mdfile = dir+'/destinations/'+country+'/states/'+state+'/cities/'+city+'/hotels/'+urlize(array[3])+'/';

     console.log('Processing ',mdfile);

     const made = mkdirp.sync(mdfile);
     
     try {
      var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
        if (err) throw err; 
      }) 
      var contents = fileContents.split("---");
      data = yaml.loadAll(contents[1]);
    } 
    catch (error) {
      var data = [];
      data[0]  = {};
      data[0].title           = array[3];
      data[0].translationKey  = urlize(array[3]);
      data[0].type            = 'hotel';
    }

    /*
    0=country 1=state  2=city  3=organisation  addressdetails_id addressbook_id  6=salutation  7=firstname 8=lastname  9=title extension 11=email 
    12=phoneres  13=mobile  OrderNo
    */

    try {

      let newData = {};

      newData.salutation  = array[6];
      newData.firstname   = array[7];
      newData.lastname    = array[8];
      newData.title       = array[9];
      newData.email       = array[11];
      newData.phone       = array[12];
      newData.mobile      = array[13];

      if (typeof data[0].contacts === 'undefined'){
        data[0].contacts = [];
      };

        // reset rates to null
        // data[0].contacts = []; 
        data[0].contacts.push(newData);

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2];

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (err) {
        console.log("Route import writing "+mdfile+": " + err.message);
      }   

    } else if ( request.file == 'hotel-categories.csv') {

    var country   = urlize(array[0]);
    var state     = urlize(array[1]);
    var city      = urlize(array[2]);

    var mdfile = dir+'/destinations/'+country;

    if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
    };
      
    mdfile += '/cities/'+city+'/hotels/'+urlize(array[3])+'/';

     console.log('Processing ',mdfile);

     const made = mkdirp.sync(mdfile);
     
     try {
      var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
        if (err) throw err; 
      }) 
      var contents = fileContents.split("---");
      data = yaml.loadAll(contents[1]);
    } 
    catch (error) {
      var data = [];
      data[0]  = {};
      data[0].title           = array[3];
      data[0].translationKey  = urlize(array[3]);
      data[0].type            = 'hotel';
    }

    /*
    0=country 1=state 2=city  3=organisation 4=Ranking 5=category

    */

    try {

        if (typeof array[4] === 'undefined'){
          data[0].ranking = 0;
        }

        if (typeof array[5] === 'undefined'){
          data[0].category = [];
        }

        if (Number(array[4]) > 0){
          data[0].ranking = Number(array[4]);
        }

        // reset to null
        //data[0].category = [];
        data[0].category.push(array[5]);

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2];

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (err) {
        console.log("Route import writing "+mdfile+": " + err.message);
      }   
    } else if ( request.file == 'services-desc.csv') {

      /*
0=country 1=state 2=city  3=description 4=organisation  5=duration  6=starttime 7=transfer  8=daysofoperation 9=owntransport  10=Guide 11=DayAtLeisure  12=writeup 13=active
*/
      var country   = urlize(array[0]);
      var state     = urlize(array[1]);
      var city      = urlize(array[2]);
      
    
      var mdfile = dir+'/destinations/'+country;

      if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
      };
      
      mdfile += '/cities/'+city+'/transfers/'+urlize(array[3])+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        data[0] = {};
        data[0].title           = array[3];
        data[0].translationKey  = urlize(array[3]);
        data[0].type            = 'transfer';
        data[0].duration        = array[5];
        data[0].startTime       = array[6];
        data[0].transfer        = Number(array[7]);
        data[0].daysOfOperation = Number(array[8]);
        data[0].vehicle         = Number(array[9]);
        data[0].guide           = Number(array[10]);
        data[0].dayAtLeisure    = Number(array[11]);
        data[0].active          = Number(array[13]);

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[12] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (err) {
        console.log("Route import writing "+mdfile+": " + err.message);
      }   
    } else if ( request.file == 'costservices-entrance.csv') {

      /*
      0=state,1=city,2=organisation,3=description,costservices_id,addressbook_id,services_id,7=wef,8=remarks,tourleaderfree,
      10=servicecharges,11=agentcharges,12=commissionontransport,cities_id,costservicesdistinct_id,costservicesentrancefees_id,costservices_id,
      17=frompax,18=topax,19=cost,tourleaderfree,21=remarks,22=currencies_id,23=resident,24=SpecialGst,25=nett
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
        var fileContents = "---\n\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        //data[0] = {}
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
        ratesData.currency        = (array[22] == 13) ? 'INR' : array[22];
        ratesData.resident        = array[23];
        ratesData.gst             = array[24];
        ratesData.nett            = array[25];

        if (typeof data[0].entranceFees === 'undefined'){
          data[0].entranceFees = [];
        };
        if (typeof data[0].miscellaneous === 'undefined'){
          data[0].miscellaneous = [];
        };
        if (typeof data[0].guides === 'undefined'){
          data[0].guides = [];
        };
        if (typeof data[0].transport === 'undefined'){
          data[0].transport = [];
        };

        // reset rates to null
        // data[0].entranceFees = []; 
        data[0].entranceFees.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[8] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (err) {
        console.log("Route import writing "+mdfile+": " + err.message);
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
      var fileContents = "---\n\n---\n";
    }

    try {

      let contents = fileContents.split("---");
      let data     = yaml.loadAll(contents[1]);


        // data = {}; data[0]={};
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
        ratesData.currency        = (array[22] == 13) ? 'INR' : array[22];
        ratesData.resident        = array[23];
        ratesData.gst             = array[24];
        ratesData.nett            = array[25];
        
        if (typeof data[0].guides === 'undefined'){
          data[0].guides = [];
        };

        // reset rates to null
        // data[0].guides = []; 
        data[0].guides.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[8] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+mdfile+": " + error.message);
      } 
    } else if ( request.file == 'costservices-misc.csv') {

      /*
    0=state,1=city,2=organisation,3=description,costservices_id,addressbook_id,services_id,7=wef,8=remarks,
    tourleaderfree,10=servicecharges,11=agentcharges,12=commissionontransport,cities_id,costservicesdistinct_id,
    costservicesothers_id,costservices_id,17=frompax,18=topax,19=costperperson,20=costpergroup,21=remarks,
    tourleaderfree,22=currencies_id,23=resident,tourleader,25=SpecialGst,26=nett
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
      var fileContents = "---\n\n---\n";
    }

    try {

      let contents = fileContents.split("---");
      let data     = yaml.loadAll(contents[1]);

        // data = {}; data[0]={};
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
        ratesData.currency        = (array[22] == 13) ? 'INR' : array[22];
        ratesData.resident        = array[23];
        ratesData.gst             = array[25];
        ratesData.nett            = array[26];

        if (typeof data[0].miscellaneous === 'undefined'){
          data[0].miscellaneous = [];
        };

        // reset rates to null
        // data[0].guides = []; 
        data[0].miscellaneous.push( ratesData );

        let output = `---\n` + yaml.dump(data[0]) + "---\n" + array[8] ;

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })
      } catch (error) {
        console.log("Route import writing "+mdfile+": " + error.message);
      } 

    } else if ( request.file == 'costservices-transport.csv') {

      /*
      0=state,1=city,2=organisation,3=description,costservices_id,addressbook_id,services_id,7=wef,8=remarks,tourleaderfree,
      10=servicecharges,11=agentcharges,12=commissionontransport,cities_id,costservicesdistinct_id,costservicestransport_id,
      costservice_id,17=frompax,18=topax,vehicles_id,fit,costnonac,22=costac,23=parkingfee,24=currencies_id,masters_id,
      obsolete,27=RoadTaxPerDay,28=MeetAndAssist,29=EntryAp,30=SpecialGst,31=nett,32=SpecialGst2,33=nett2,34=vehicle
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
        var fileContents = "---\n\n---\n";
      }

      try {

        let contents = fileContents.split("---");
        let data     = yaml.loadAll(contents[1]);

        // data = {}; data[0]={};
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
        ratesData.cost            = Number(array[22]) || 0;
        ratesData.parking         = Number(array[23]) || 0;
        ratesData.currency        = (array[24] == 13) ? 'INR' : array[24];
        ratesData.roadTax         = Number(array[27]) || 0;
        ratesData.meetNassist     = Number(array[28]) || 0; 
        ratesData.entry           = Number(array[29]) || 0;
        ratesData.gst             = array[32] ;
        ratesData.nett            = Number(array[33]) || 0;
        ratesData.vehicle         = array[34];
        
        if (typeof data[0].transport === 'undefined'){
          data[0].transport = [];
        };

        // reset rates to null
        // data[0].transport = []; 
        data[0].transport.push( ratesData );

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
    } else if ( request.file == 'hotels-addressbook.csv') {

      /*
      0=country 1=state 2=city  3=bookthrough 4=mailto 5=organisation  6=address 7=city  8=postalcode 9=phone 10-email 
      11=www 12=note  13=areacode  14=currencies_id 15=org_mobile  16=category  17=ranking
      */ 


      var country           = urlize(array[0]);
      var state             = urlize(array[1]);
      var city              = urlize(array[2]);
      var organisation      = urlize(array[5]);

      var mdfile = dir+'/destinations/'+country+'/states/'+state+'/cities/'+city+'/hotels/'+organisation+'/';

      console.log('Processing ',mdfile);

      const made = mkdirp.sync(mdfile);

      try {
        var fileContents = fs.readFileSync(mdfile+'_index.md', 'utf8', (err) => {       
          if (err) throw err; 
        }) 
      } 
      catch (error) {
        var fileContents = "---\n\n---\n";
      }

      try {

        var frontMatter                 = {};
        frontMatter.title           = array[5];
        frontMatter.translationKey  = organisation;
        frontMatter.bookthrough     = array[3] ;
        frontMatter.mailto          = array[4];
        frontMatter.address         = array[6];
        frontMatter.city            = array[7];
        frontMatter.postalcode      = array[8];
        frontMatter.phone           = array[13]+'-'+array[9];
        frontMatter.mobile          = array[15];
        frontMatter.email           = array[10];
        frontMatter.website         = array[11];
        frontMatter.note            = array[12];
        
        if (array[17] > 0) {
          frontMatter.ranking       = array[17];
        }
        frontMatter.type            = 'hotel';
        
        if (typeof frontMatter.category === 'undefined'){
          frontMatter.category = [];
        };

        // reset rates to null
        // frontmatter.category = []; 
        frontMatter.category.push(array[16]);

        let output = `---\n` + yaml.dump(frontMatter) + "---\n" ;
        // + array[ 5].replace(/[`]/g, "'");

        fs.writeFileSync(mdfile+'_index.md', output, 'utf8', (err) => {       
          if (err) throw err; 
        })

      } catch (error) {
        console.log("Route import writing "+state+": " + error.message);
      } 
    } else if ( request.file == 'services.csv') {

      // 0=country 1=state 2-city  3=description 4=duration  5=starttime 6=transfer  7=transfercode  8=active  9=daysofoperation 10=city  
      // 11=to_cities_id  12=owntransport  13=guide 14=dayatleisure 15=writeup

      var country           = urlize(array[0]);
      var state             = urlize(array[1]);
      var city              = urlize(array[2]);
      var description       = urlize(array[3]);
      var mdfile            = dir+'/destinations/'+country;

      if (country == 'india'){ 
        if (typeof state === "undefined") throw "state for "+city+" is undefined";
        mdfile += '/states/'+state; 
      };
      
      mdfile += '/cities/'+city+'/excursions/'+description+'/';

      console.log('Processing ',mdfile); 

      const made = mkdirp.sync(mdfile);

      try {

        var web     = Number(array[8]) || 0;
        var writeup = array[15].trim().toString().replace(/[`]/g, "'");

        frontMatter                 = {};
        frontMatter.title           = array[3];
        frontMatter.translationKey  = description;
        frontMatter.duration        = array[4] || '';
        frontMatter.startTime       = (array[5] == 'NULL') ?  '' : array[4];
        frontMatter.transfer        = (array[6] == 'NULL') ?  false : true;
        frontMatter.transferCode    = (array[7] == 'NULL') ?  '' : array[6];
        frontMatter.draft           = (web == 0) ?  true : false; 
        frontMatter.daysOfOperation = (array[9] == 'NULL') ?  0  : Number(array[8]);
        frontMatter.toCity          = (array[10] == 'NULL') ?  '' : array[9];
        frontMatter.toCitiesId      = (array[11] == 'NULL') ?  '' : array[10];
        frontMatter.owntransport    = (array[12] == 1) ?  true : false;
        frontMatter.guide           = (array[13] == 1) ?  true : false;
        frontMatter.dayAtLeisure    = (array[14] == 1) ?  true : false;
        frontMatter.type            = 'excursion';
        frontMatter.tags            = ['Services',array[3].replace(/[.]/g, '') ];

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

app.post('/rename',function (req, res) {

  var request      = JSON.parse(req.body.data);
  var destFileName = dir + request.destFileName;
  var srcFileName  = dir + request.srcFileName;
  var srcDir       = srcFileName.replace("index.md","");
  var destDir      = destFileName.replace("index.md","");

  console.log('Renaming '+srcDir);

  mkdirp( getDirName( destFileName ));

  try {
    var fileContents = fs.readFileSync(srcFileName, 'utf8', (err) => {       
      if (err) throw err;
    });
  } 
  catch (err) {
    console.log('Route rename reading: ' + err.message);
  } 

  try {
    let contents       = fileContents.split("---");
    let data           = yaml.loadAll(contents[1]);
    let fm             = request.data[0];
    let srcData        = data[0];
    let destData       = {...srcData, ...fm };
    let output         = `---\n` + yaml.dump( destData ) + "---\n"; 
    
    output += ( request.data[1].length > 0 ) ? request.data[1] : contents[2];

    fs.writeFileSync( destFileName, output, function(err) {
      if(err) return console.error('write error: '+err);
      // console.log('Successfully wrote to the file!');
    });
  } 
  catch (err) {
    // console.log('Route ajax writing: ' + err.message);
  } 

  try {
    fse.copySync(srcDir, destDir, { overwrite: true } ,function (err) {
      if (err) { 
        console.error(err); 
      } 
      else { 
        // console.log("success!"); 
      }
    });
  }
  catch (error) {
    console.log('Moving directory: ' + error.message);
  } 

  try {
    fs.rmdirSync(srcDir, { recursive: true });
    // console.log('Successfully deleted ',srcDir);
  } 
  catch (err) {
    console.error('Error deleting:', err.message);
  }

  const cmd = "grep -RiIl '"+srcDir+"' | xargs sed -i 's|"+srcDir+"|"+destDir+"|g'";
  
  console.log(cmd);

  const search = spawn.spawnSync(cmd);

  console.log(`Stdout: ${search.stdout}`);
  console.log(`Stderr: ${search.stderr}`);

});

app.post('/copytotours',function (req, res) { 

  var request = JSON.parse(req.body.data);
  var from    = dir + request.from;
  var to      = dir + request.to;

  copydir(from, to, {utimes:false, mode:true, cover:false
  }, function(err){
    if(err) throw err;
    console.log('done');
  });
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
  } 
  catch (error) {
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
  } 
  catch (error) {
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
 } 
 catch(err) { 
  console.error(err); 
};

res.end();
});


app.post('/geolocation',function (req, res) {

  require('dotenv').config();

  
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

app.post('/write-to-tour',function (req, res) {

  /* 
    purpose  : module to save an itinerary in TIM as a tour in the particular region of the destination 
    called by: itinerary/list.html

    It copies the itinerary and changes the type so that the page is displayed as a tour itinerary
    */

    const request       = JSON.parse(req.body.data);
    const srcFile       = dir + request.file + '_index.md';
    const array         = srcFile.split("/");
    const destFile      = dir + request.region + array[array.length-2] + '/_index.md' ;
    var   fileContents  = "---\n ---\n";

    console.log('Processing to copy the itinerary ' + srcFile + ' to ' + destFile);

    const made = mkdirp.sync(getDirName( destFile ))
    if (made == 'undefined'){ console.log(`Made directories`) };

    try {
      fileContents = fs.readFileSync(srcFile, 'utf8', (err) => {       
        if (err) throw err; 
      }) 
    } 
    catch (error) {
    // use the default for fileContents 
  }

  try {
    var contents = fileContents.split("---");
    var data     = yaml.loadAll(contents[1]);

    if (typeof data[0] === 'undefined'){
          data[0] = [];
        };

    data[0].type = 'tour';

    let output = `---\n` + yaml.dump(data[0]) + "---\n" + contents[2] ;

    fs.writeFileSync(destFile, output, 'utf8', (err) => {       
      if (err) throw err; 
      console.log("Itinerary written successfully to ",destFile); 
    });
  } 
  catch(err) { 
    console.error(err); 
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