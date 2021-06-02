// This module contains all the functions to operate the select dropdowns in the Search section of the itinerary page

import docLoad from './docload.js';
import draggable from './itinerary.js';

var host = window.location.host + "/";


/* CREATE THE SELECT BOXES OTHER THAN CITIES (that one is done in Hugo) */


function selectHotels(city, type){

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
		});
};

function selectExcursions(city){

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
		});
};

function selectTransfers(city){

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
		});
};

/* CHANGES IN A SELECT BOX */

export default function changeType(id){
	const source = document.getElementById(id);
	if ( typeof source[source.selectedIndex] !== 'undefined'){
		var url = source[source.selectedIndex].value;
		processRequest(url);
		if (id == 'city'){
			//displayCity(city);
			selectHotels(url,id);
			selectExcursions(url,id);
			selectTransfers(url,id);
		};
	};
};

/* DISPLAY THE INFO OF THE OPTION CHANGED */

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
		});
};

/*
export default function displayCity(city){

	var file = host+city+"index.json";

	docLoad({url: file }).then(

		function(response) {

			const data  = JSON.parse(response);

			if ( data.image != undefined){
				const image = 'url("'+host+city+(data.image)+'")';
				document.getElementById("image").style.backgroundImage = 'url("'+image+'")';
			};
			document.getElementById("info").innerHTML = data.content;
		}, 
		function(Error) {
			console.log(Error);
		});
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
*/

// THE MAIN FUNCTIONS: GET THE SELECTION AND ADD IT TO THE ITINERARY

export function getSelection(id){

	const source = document.getElementById(id);
	const i      = source.selectedIndex;
	const url    = source[i].value ;
	const text   = source[i].innerHTML;

	if (i > 0) {
		addToWorkspace(id,url,text);
	};
};

function addToWorkspace(type,url,text){
	let ws     = document.getElementById('toggleWorkspace');
	const html = '<div class="draggable" draggable="true" type ="'+type+'" url="' + url + '"><i class="icon-'+type+'"></i>&nbsp;<span class="title">' + text+'</span></div>';

	if (ws.className.includes("showWorkspace") === true){
		document.getElementById("workspace").innerHTML += html;
	} else {
		let days   = document.getElementById('myItinerary').getElementsByClassName('containers');
		let length = days.length;
		days[days.length -1 ].innerHTML += html;
	};
	draggable();
};