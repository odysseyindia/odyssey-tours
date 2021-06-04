import docLoad from './docload.js';

var host       = window.location.pathname;
var appHost    = window.location.protocol + "//" + window.location.hostname + ":" + (parseFloat(window.location.port) + parseFloat(1)) +'/';

var hotelSelect = document.getElementById("hotels");

/* ON CHANGE */

function changeHotel(){
  if ( typeof hotelSelect[hotelSelect.selectedIndex] !== 'undefined'){
    var option = hotelSelect[hotelSelect.selectedIndex].value;
    displayData(option);
  }
};

/* DISPLAY THE DATA */

function displayData(urldata){

  docLoad({url: urldata+"/index.json" }).then(

    function(response) {

      const data  = JSON.parse(response);
      const image = urldata+data.image;

      if (data.image){
        document.getElementById("image").innerHTML = '<img src="'+image+'" alt="hotel image">';
      } else {
        document.getElementById("image").innerHTML = '';
      }

      const url = data.permalink.split("/");
      document.getElementById("url").innerText         = url[url.length-2];
      document.getElementById("title").innerText       = data.title;
      document.getElementById("address").innerText     = data.address;
      document.getElementById("city").innerText        = data.city;
      document.getElementById("postalcode").innerText  = data.postalcode;
      document.getElementById("phone").innerText       = data.phone;
      document.getElementById("email").innerText       = data.email;
      document.getElementById("www").innerText         = data.wwww;
      document.getElementById("note").innerText        = data.note;
      document.getElementById("bookThrough").innerText = data.bookThrough;
      document.getElementById("mailTo").innerText      = data.mailTo;
      document.getElementById("checkout").innerText    = data.checkout;
      document.getElementById("accessAir").innerText   = data.accessAir;
      document.getElementById("accessRail").innerText  = data.accessRail;
      document.getElementById("accessBus").innerText   = data.accessBus;
      document.getElementById("content").innerHTML     = data.content;
      document.getElementById("gstType").innerText     = data.gstType;

      document.getElementById("starCategory").value    = Number(data.starCategory);
      document.getElementById("ranking").value         = Number(data.ranking);
      document.getElementById("rooms").value           = Number(data.rooms);
      document.getElementById("category").selectedIndex = data.category;
      
      document.getElementById("nighthalt").checked     = (data.nighthalt == 'true')? true : false;;
      document.getElementById("showHotel").checked     = (data.showHotel == 'true')? true : false;
      document.getElementById("web").checked           = (data.web == 'true')? true : false;
    }, 
    function(Error) {
      console.log(Error);
    });
};

/* SAVE THE DATA */

document.getElementById("save").addEventListener("click", function(){

  try {

    if (hotelSelect.selectedIndex == 0 ) throw "No selection made";

    const permalink         = hotelSelect[hotelSelect.selectedIndex].value ;
    const newKey            = permalink.split("/");
    const key               = newKey.length-2;

    const category          = document.getElementById("category");
    newKey[key]             = document.getElementById("url").innerText;

    var data                = [];
    data[0]                 = {};
    data[0].translationKey  = newKey.join('/');
    data[0].title           = document.getElementById("title").innerText ;
    data[0].address         = document.getElementById("address").innerText ;
    data[0].city            = document.getElementById("city").innerText ;
    data[0].postalcode      = document.getElementById("postalcode").innerText;
    data[0].phone           = document.getElementById("phone").innerText   ;
    data[0].email           = document.getElementById("email").innerText ;
    data[0].www             = document.getElementById("www").innerText ;
    data[0].note            = document.getElementById("note").innerText;
    data[0].bookThrough     = document.getElementById("bookThrough").innerText;
    data[0].mailTo          = document.getElementById("mailTo").innerText ;
    data[0].checkout        = document.getElementById("checkout").innerText
    data[0].accessAir       = document.getElementById("accessAir").innerText;
    data[0].accessRail      = document.getElementById("accessRail").innerText;
    data[0].accessBus       = document.getElementById("accessBus").innerText;
    data[1].content         = document.getElementById("content").innerText.replace(/[`]/g, "'");
    data[0].gstType         = document.getElementById("gstType").innerText;

    data[0].starCategory    = document.getElementById("starCategory").value;
    data[0].ranking         = document.getElementById("ranking").value;
    data[0].rooms           = document.getElementById("rooms").value;
    data[0].category        = category[category.selectedIndex].value;

    data[0].nighthalt       = (document.getElementById("nighthalt").checked == true) ? true : false;
    data[0].showHotel       = (document.getElementById("showHotel").checked == true) ? true : false;
    data[0].web             = (document.getElementById("web").checked       == true) ? true : false;


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
      };
    } else {
      let spinner = document.getElementById("in-progress");
      spinner.style.display  = 'block';

      docLoad({
        url:    'ajax', 
        method: 'POST',
        dataTransfer:   JSON.stringify({ 
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

hotelSelect.addEventListener("change", (event) => { changeHotel(); });
