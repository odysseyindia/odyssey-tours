import docLoad from './docload.js';

var host       = window.location.pathname;
var appHost    = window.location.protocol + "//" + window.location.hostname + ":" + (parseFloat(window.location.port) + parseFloat(1)) +'/';

var excuSelect = document.getElementById("excursions");
var citySelect = document.getElementById("cities");


/* CREATE SELECT DROPDOWNS */

function selectExcursions(urldata){

  docLoad({url: urldata+"excursions/index.json" }).then(

    function(response) {

      const nonl  = response.replace(/(\n)/gm,"");
      var   data  = JSON.parse(nonl);
      const items = data.data.items;
      var   sel   = '<option value="">Select an excursion</option>';

      if (items.length > 0) {
        for(let i=0;i<items.length;i++) {
          sel += "<option value='"+items[i].permalink+"'>"+items[i].title+"</option>"
        }
        excuSelect.innerHTML = sel;
      } 
    }, 
    function(Error) {
      console.log(Error);
    });
};

/* ON CHANGE */

function changeCity(){

  const city = citySelect[citySelect.selectedIndex].value ;

  if (city){ selectExcursions(city); };
};


function changeExcursion(){
  if ( typeof excuSelect[excuSelect.selectedIndex] !== 'undefined'){
    displayData( excuSelect[excuSelect.selectedIndex].value );
  }
};

/* DISPLAY THE DATA */

function displayData(urldata){

  docLoad({url: urldata+"/index.json" }).then(

    function(response) {

      const data  = JSON.parse(response);
      const image = urldata+data.image;

      if (data.image){
        document.getElementById("image").innerHTML = '<img src="'+image+'" alt="excursion image">';
      } else {
        document.getElementById("image").innerHTML = '';
      }

      const url = data.permalink.split("/");

      document.getElementById("url").innerText              = url[url.length-2];
      document.getElementById("title").innerText            = data.title;
      document.getElementById("duration").innerText         = data.duration;
      document.getElementById("startTime").innerText        = data.startTime;
      document.getElementById("daysOfOperation").innerText  = data.daysOfOperation;
      document.getElementById("vehicle").checked            = (data.vehicle == 'true')? true : false; ;
      document.getElementById("guide").checked              = (data.guide == 'true')? true : false; ;
      document.getElementById("dayAtLeisure").checked       = (data.dayAtLeisure == 'true')? true : false; ;
      document.getElementById("content").innerHTML          = data.content;

    }, 
    function(Error) {
      console.log(Error);
    });
};

/* SAVE THE DATA */

document.getElementById("save").addEventListener("click", function(){

  try {

    if (excuSelect.selectedIndex == 0 ) throw "No selection made";

    const permalink         = excuSelect[excuSelect.selectedIndex].value ;
    const newKey            = permalink.split("/");
    const key               = newKey.length-2;

    newKey[key]             = document.getElementById("url").innerText;

    var data                = [];
    data[0]                 = {};
    data[0].translationKey  = newKey.join('/');
    data[0].title           = document.getElementById("title").innerText;
    data[0].duration        = document.getElementById("duration").innerText;
    data[0].startTime       = document.getElementById("startTime").innerText;
    data[0].daysOfOperation = document.getElementById("daysOfOperation").value;
    data[0].vehicle         = (document.getElementById("vehicle").checked      == true) ? true : false;
    data[0].guide           = (document.getElementById("guide").checked        == true) ? true : false;;
    data[0].dayAtLeisure    = (document.getElementById("dayAtLeisure").checked == true) ? true : false;
    data[1]                 = document.getElementById("content").innerHTML.replace(/[`]/g, "'");

    if (permalink != data[0].translationKey){
      if (confirm("URL will be changed to \n"+ url+"\nAre you certain you want to do this?")){
        let spinner = document.getElementById("in-progress");
        spinner.style.display  = 'block';

        docLoad({
          url:    'rename', 
          method: 'POST',
          data:   JSON.stringify({ 
            "destFileName" : newKey.join('/')+'_index.md',
            "data"         : data,
            "srcFileName"  : permalink+'_index.md',
          }) 
        })
        .then(
          function(response){ /* console.log( statusText ); */ }, 
          function(Error   ){ console.log( Error ); }  
          );
      }
    } else {
      let spinner = document.getElementById("in-progress");
      spinner.style.display  = 'block';

      docLoad({
        url:    'ajax', 
        method: 'POST',
        data:   JSON.stringify({ 
          "file"   : permalink+'index.md', 
          "data"   : data,
        }) 
      })
      .then(
        function(response){ console.log( statusText ); }, 
        function(Error   ){ console.log( Error ); }
        );
    }
  }

  catch (error) {
    var element                 = document.getElementById("message");
    element.innerText           = "No item selected";
    element.style.color         = "red";
    element.style["text-align"] = "center";
  }

});

/* =============== add EventListeners ============ */

citySelect.addEventListener("change", (event) => { changeCity(); });
excuSelect.addEventListener("change", (event) => { changeExcursion(); });