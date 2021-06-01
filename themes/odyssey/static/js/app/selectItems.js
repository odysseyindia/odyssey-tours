import docLoad from './docload.js';

var   host   = window.location.href.split("/");
host   = host[0] + "//" + host[2];

export function changeCity(){
	const source = document.querySelector("#cities")
	const city   = source[source.selectedIndex].value ;
	const img    = document.getElementById("cityImage");

	if (city){
		displayCity(city);
		selectHotels(city);
		selectExcursions(city);
		selectTransfers(city);
	}
};

export function changeHotel(){
	const source = document.querySelector("#hotel");
	if ( typeof source[source.selectedIndex] !== 'undefined'){
		var url = source[source.selectedIndex].value;
		processRequest(url);
	}
};

export function changeExcursion(){
	const source = document.querySelector("#excursion");
	if ( typeof source[source.selectedIndex] !== 'undefined'){
		var url = source[source.selectedIndex].value;
		processRequest(url);
	}
};

export function changeTransfer(){
	const source = document.querySelector("#transfer");
	if ( typeof source[source.selectedIndex] !== 'undefined'){
		var url = source[source.selectedIndex].value;
		processRequest(url);
	}
};

function processRequest(url){

	var file = host+url+"index.json";

	docLoad({url: file }).then(

		function(response) {

			var data    = JSON.parse(response);
			var content = data.content.replace(/linebreak/gm,"");

			document.getElementById("info").innerHTML = content;

			if ( data.image != undefined){
				const image = 'url("'+host+url+(data.image)+'")';
				document.getElementById("image").style["background-image"] = image;
			};
		}, 

		function(Error) {
			console.log(Error);
		}
		);
};

export default function displayCity(city){

  	// const city = urldata.split("/")[(urldata.split("/")).length-2];

  	var file = host+city+"index.json";
  	
  	docLoad({url: file }).then(

  		function(response) {

  			const data  = JSON.parse(response);

  			if ( data.image != undefined){
  				const image = 'url("'+host+city+(data.image)+'")';
  				document.getElementById("image").style.backgroundImage = 'url("'+image+'")';
  			}
  			document.getElementById("info").innerHTML = data.content;
  		}, 

  		function(Error) {
  			console.log(Error);
  		}
  		);
  };

  function displayHotel(city){

  	docLoad({url: host+city+"hotels/index.json" }).then(

  		function(response) {

  			const data  = JSON.parse(response);
  			const image = host+city+data.image;

  			if (image){
  				document.getElementById("image").style.backgroundImage = 'url("'+image+'")';
  			}
  			document.getElementById("info").innerHTML = data.content;
  		}, 

  		function(Error) {
  			console.log(Error);
  		}
  		);
  };


  export function selectHotels(city){

  	var element = document.getElementById("select-hotel");

  	docLoad( {url: host+city+"hotels/index.json"} ).then(

  		function(response){

  			const data  = JSON.parse(response);
  			const image = host+city+data.image;
  			const items = data.data.items;
  			var   sel   = '<option value="">Select a hotel</option>';

  			if (items.length > 0) {
  				for(let i=0;i<items.length;i++) {
  					if ('category' in items[i] && items[i].category.length > 0){ 
  						sel += "<option value='"+items[i].permalink+"'>"+items[i].title+"</option>";
  					};
  				};

  				element.style.visibility = "visible"; 
  				document.getElementById("hotel").innerHTML = sel;
  			} else {
  				element.style.visibility = "hidden";
  			};
  		}, 
  		function(Error) {
  			element.style.visibility = "hidden";
  		}
  		);
  };

  export function selectExcursions(city){

  	var element = document.getElementById("select-excursion");

  	docLoad({url: host+city+"excursions/index.json"}).then(

  		function(response) {
  			const nonl  = response.replace(/(\n)/gm,"");
  			var   data  = JSON.parse(nonl);
  			const items = data.data.items;
  			var   sel   = '<option value="">Select an excursion</option>';

  			if (items.length > 0) {
  				for(let i=0;i<items.length;i++) {
  					sel += "<option value='"+items[i].permalink+"'>"+items[i].title+"</option>";
  					element.style.visibility = "visible"; 
  					document.getElementById("excursion").innerHTML = sel;
  				};
  			} else {
  				element.style.visibility = "hidden";
  			};
  		}, 
  		function(Error) {
  			element.style.visibility = "hidden";
  		}
  		);
  };

  export function selectTransfers(city){

  	var element = document.getElementById("select-transfer");

  	docLoad({url: host+city+"transfers/index.json"}).then(

  		function(response) {
  			const nonl  = response.replace(/(\n)/gm,"");
  			var   data  = JSON.parse(nonl);
  			const items = data.data.items;
  			var   sel   = '<option value="">Select a transfer</option>';

  			if (items.length > 0) {
  				for(let i=0;i<items.length;i++) {       
  					sel += "<option value='"+items[i].permalink+"'>"+items[i].title+"</option>";
  					element.style.visibility = "visible"; 
  					document.getElementById("transfer").innerHTML = sel;
  				};
  			} else {
  				element.style.visibility = "hidden";
  			};
  		}, 
  		function(Error) {
  			element.style.visibility = "hidden";
  		}
  		);
  };