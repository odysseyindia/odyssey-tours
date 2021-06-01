  import docLoad from './docload.js';
  import * as Items from './selectItems.js';
  import fadeAlert from './fadealert.js';

  $(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
  });

  const source = document.querySelector("#cities");
  const city   = source[source.selectedIndex].value ;
  var   host   = window.location.href.split("/");
        host   = host[0] + "//" + host[2];

  var renewables = document.querySelectorAll(".draggable");

  renewables.forEach(renewable => {
    let url = renewable.getAttribute("url");
    let myClass = renewable.getElementsByClassName("content-text");

    if (url.includes("{{ htmlUnescape .RelPermalink }}")){
      let xhr = new XMLHttpRequest();
      xhr.open('get',url+"/index.json" );
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) { 
          let data = JSON.parse(xhr.responseText);
          myClass[0].innerText = data.content;
        };
      };
      xhr.send();
    }
  });

  Items.changeCity(city);
  toggleRegion();

  // add EventListeners
  document.getElementById("cities"   ).addEventListener("change", (event) => { Items.changeCity();      });
  document.getElementById("hotel"    ).addEventListener("change", (event) => { Items.changeHotel();     });
  document.getElementById("excursion").addEventListener("change", (event) => { Items.changeExcursion(); });
  document.getElementById("transfer" ).addEventListener("change", (event) => { Items.changeTransfer();  });

  document.addEventListener('DOMContentLoaded', (event) => { draggable(); });
  

  var clickClose = document.getElementsByClassName("close-modal-btn");
  var clickEdit  = document.getElementsByClassName("editButton");

  for(var i = 0; i < clickClose.length; i++) {
    (function(index) {
      clickClose[index].addEventListener("click", function() {
        var close = document.getElementsByClassName("modal");
        for(var i = 0; i < close.length; i++) {
          close[index].style.display = "none";
        };
      })
    })(i);
  }

  for(var i = 0; i < clickEdit.length; i++) {
    (function(index) {
      clickEdit[index].addEventListener("click", function() {
        editItem(clickEdit[index].parentElement);
      })
    })(i);
  }


  document.getElementById("save-modal-hotel").addEventListener("click", function(){

    const elements = document.getElementById("modal-hotel");
    const inputs   = elements.getElementsByClassName('input');
    const index    = inputs[0].index;
    const days     = document.getElementById('myItinerary').getElementsByClassName('containers');
    const items    = days[ inputs[0].day ].getElementsByClassName('draggable');
    var   data     = items[index].getElementsByClassName('details');

    const modalContent   = elements.getElementsByClassName('content');
    var content          = items[index].getElementsByClassName('content-details');
    content[0].innerHTML = "<p>"+modalContent[0].value.replace(/\n\n/g, "</p><p>")+"</p>";

    data[0].setAttribute("value", inputs.checkInDate.value ) ; 
    data[1].setAttribute("value", inputs.checkInTime.value ) ;
    data[2].setAttribute("value", inputs.checkOutDate.value) ;
    data[3].setAttribute("value", inputs.checkOutTime.value) ;
    data[4].setAttribute("value", inputs.nights.value) ;
    data[0].innerHTML  = inputs.checkInDate.value ; 
    data[1].innerHTML  = inputs.checkInTime.value ;
    data[2].innerHTML  = inputs.checkOutDate.value ;
    data[3].innerHTML  = inputs.checkOutTime.value ;
    data[4].innerHTML  = inputs.nights.value ;

    elements.style.display = "none";
  });

  document.getElementById("save-modal-excursion").addEventListener("click", function(){

    const elements        = document.getElementById("modal-excursion");
    const inputs          = elements.getElementsByClassName('input');
    const index           = inputs[0].index;
    const days            = document.getElementById('myItinerary').getElementsByClassName('containers');
    const items           = days[ inputs[0].day ].getElementsByClassName('draggable');
    var   data            = items[index].getElementsByClassName('details');

    const modalTitle      = elements.getElementsByClassName('modal-title');
    var title             = items[index].getElementsByClassName('title');
    title[0].innerText    = modalTitle[0].value;

    const modalContent    = elements.getElementsByClassName('content');
    var content           = items[index].getElementsByClassName('content-details');
    content[0].innerHTML  = "<p>"+modalContent[0].value.replace(/\n\n/g, "</p><p>")+"</p>";

    data[0].setAttribute("value", inputs.excursionDate.value ) ; 
    data[1].setAttribute("value", inputs.excursionEtd.value ) ;
    data[2].setAttribute("value", inputs.excursionDuration.value) ;
    data[0].innerHTML  = inputs.excursionDate.value ; 
    data[1].innerHTML  = inputs.excursionEtd.value ;
    data[2].innerHTML  = inputs.excursionDuration.value ;

    elements.style.display = "none";
  });

  document.getElementById("save-modal-city").addEventListener("click", function(){

    const elements = document.getElementById("modal-city");
    const inputs   = elements.getElementsByClassName('input');
    const index    = inputs[0].index;
    const days     = document.getElementById('myItinerary').getElementsByClassName('containers');
    const items    = days[ inputs[0].day ].getElementsByClassName('draggable');

    const modalContent   = elements.getElementsByClassName('content');
    var content          = items[index].getElementsByClassName('content-details');
    content[0].innerHTML = "<p>"+modalContent[0].value.replace(/\n\n/g, "</p><p>")+"</p>";

    elements.style.display = "none";
  });

// allow drag and drop

function draggable(){
  var draggables = document.querySelectorAll('.draggable');
  var containers = document.querySelectorAll('.containers');

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart',() => {
      draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend',() => {
      draggable.classList.remove('dragging');
    });
  });

  containers.forEach(container => {
    container.addEventListener('dragover',e => {
      e.preventDefault()
      const afterElement = getDragAfterElement(container,e.clientY)
      const draggable = document.querySelector('.dragging')
      if (afterElement == null){
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable,afterElement);
      };
    });
  });
};

function toggleRegion (){

  const region = document.getElementById('region');
  var   button = document.getElementById('writeButton');
  const option = region.selectedIndex ;
  
  if ( option > 0 ){
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
};


function getDragAfterElement(container,y){
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest,child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  },{offset: Number.NEGATIVE_INFINITY}).element;

};





function toggleContent(){
  let days   = document.getElementById('myItinerary').getElementsByClassName('containers');

  let element = document.getElementById('toggleContent');
  if (element.innerText === 'Expand') {
    element.innerHTML = '<i class="icon-minus-squared"></i>Compact';
  } else {
    element.innerHTML = '<i class="icon-plus-squared"></i>Expand';
  }

  for(let i=0;i<days.length;i++) {

    var items   = days[i].getElementsByClassName('content');
    for(let j=0;j<items.length;j++) {
      if (items[j].style.display === "none") {
        items[j].style.display = "flex";
      } else {
        items[j].style.display = "none";
      }
    };
  };
};

function toggleCalendar(){

  let days   = document.getElementById('myItinerary').getElementsByClassName('containers');

  for(let i=0;i<days.length;i++) {

    var items   = days[i].getElementsByClassName('rowdetails');
    for(let j=0;j<items.length;j++) {
      if (items[j].style.visibility === "visible") {
        items[j].style.visibility = "hidden";
      } else {
        items[j].style.visibility = "visible";
      }
    };
  };
};

function toggleWorkspace(){

  let element = document.getElementById('toggleWorkspace');
  element.classList.toggle("showWorkspace");
  if (element.innerText === "Use Itinerary") {
    element.innerHTML = '<i class="icon-wrench"></i>Use Workspace';
  } else {
    element.innerHTML = '<i class="icon-list-numbered"></i>Use Itinerary';
  }
};


function activateTour(){
  var tourRelated = document.getElementsByClassName('tour-section');

  for (var i=0; i<tourRelated.length; i++){
    if (tourRelated[i].value > 0){
      tourRelated[i].style.display = "block";
    } else {
      tourRelated[i].value = 0;
      tourRelated[i].style.display = "none"
    };
  };
};


function addDay(){

  let element  = document.getElementById('addDay');
  let days     = document.getElementById('myItinerary').getElementsByClassName('containers');

  let div   = document.createElement('hr');
  div.className = "hr-text";
  div.dataset.content = "Day "+ (days.length + 1);
  
  element.parentNode.insertBefore(div, element);

  div = document.createElement('div');
  div.className = "containers";
  div.innerHTML = "\n";

  element.parentNode.insertBefore(div, element);

  draggable();
};

function saveItinerary(deleteDay){

  var itinerary    = [];
  
  var themeOptions = document.getElementsByClassName('theme');
  var themes = [];
  for (var i=0; i<themeOptions.length; i++){
    if (themeOptions[i].checked){
      themes.push( themeOptions[i].value );
    };
  };

  var lines        = document.getElementById('intro-highlights').value.split(/\n/);
  var highlights   = [];
  for (var i=0; i<lines.length; i++){
    if ( lines[i].length ){
      highlights.push( lines[i].trim() );
    };
  };

  const days = document.getElementById('myItinerary').getElementsByClassName('containers');
  for(let i=0;i<days.length;i++) {

    if (i != deleteDay){
      var items   = days[i].getElementsByClassName('content');
      for(let j=0;j<items.length;j++) {
        if (items[j].style.display === "none") {
          items[j].style.display = "flex";
        }
      };

      var details = [];
      var items   = days[i].getElementsByClassName('draggable');

      for(let j=0;j<items.length;j++) {

        var obj = {};
        obj.type    = items[j].getAttribute("type");
        obj.url     = items[j].getAttribute("url");
        let title   = items[j].getElementsByClassName('title');
        obj.title   = title[0].innerText.trim().replace(/(`)/gm,"'");
        let content = items[j].getElementsByClassName('content-text');
        obj.content = (content.length != 0) ? content[0].innerText.trim().replace(/(`)/gm,"'") : "";

        let inputs  = items[j].getElementsByClassName('details');
        for(let k=0;k<inputs.length;k++) {
          let attr  = inputs[k].getAttribute("attr");
          let value = inputs[k].getAttribute("value");
          obj[attr] = (value != null) ? value : inputs[k].innerText ;

          if (inputs[k].getAttribute("type") == 'date'){
            const formatYmd = date => date.toISOString().slice(0, 10);
            obj[attr] = (value != null) ? formatYmd(new Date(value)) : inputs[k].innerText ; 
          }

        };

        details.push(obj);
      };

      let object  = {};
      object.day  = i;
      object.item = details;
      itinerary.push( object );
      
    };
  };

  var spinner        = document.getElementById("in-progress");
  const region       = document.getElementById('region');  
  var content        = document.getElementById('intro-content').value;
  var data           = []; 
  data[0]            = {};
  data[0].itinerary  = itinerary;
  data[0].subtitle   = document.getElementById('intro-subtitle').value;
  data[0].weight     = document.getElementById('intro-weight').value;
  data[0].highlights = highlights;
  data[0].themes     = themes;
  data[0].region     = region[region.selectedIndex].value;
  data[1]            = content.replace(/[`]/g, "'");

  spinner.style.display  = 'block';

  docLoad({
    url:    'ajax', 
    method: 'POST',
    apphost: '{{ .Site.Params.appHost }}', 
    data:   JSON.stringify({ 
      "file": "{{ .RelPermalink }}"+'_index.md', 
      "data": data
    }) 
  })
  .then(
    function(response){ 
      console.log( statusText ); 
    }, 
    function(Error){ 
      console.log( Error ); 
    }
    );
};


function writeToTour(){

  if (confirm("This will republish this itinerary as a tour.\nAre you certain?\n")){

    docLoad({
      url:    'write-to-tour', 
      method: 'POST',
      apphost: '{{ .Site.Params.appHost }}', 
      data:   JSON.stringify({ 
        "file"  : "{{ .RelPermalink }}", 
        "region": document.getElementById('region').value,
      })
    })
    .then(
      function(response){ 
        fadeOut('Itinerary saved as a tour');
      }, 
      function(Error){  console.log( Error );       }
    );
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

function addCity(){

  const source = document.querySelector("#cities");
  const i      = source.selectedIndex;
  const url    = source[i].value ;
  const text   = source[i].innerHTML;
  
  if (i > 0) {
    addToWorkspace('city',url,text);
  };
};

function addHotel(){

  const source = document.querySelector("#hotels");
  const ws     = document.getElementById('toggleWorkspace');
  const i      = source.selectedIndex;
  const url    = source[i].value ;
  const text   = source[i].innerHTML;

  if (i > 0) {
    addToWorkspace('hotel',url,text);
  };
};

function addExcursion(){

  const source    = document.querySelector("#excursions");
  const ws        = document.getElementById('toggleWorkspace');
  const i         = source.selectedIndex;
  const value     = JSON.parse(source[i].value );
  const url       = value.url;
  const transfer  = value.transfer;
  const text      = source[i].innerHTML;

  if (transfer == true){
    addToWorkspace('transfer',url,text);
  } else {
    addToWorkspace('excursion',url,text);
  };
};


function emptyTrash(){
  var trash = document.getElementById("trash");
  trash.innerHTML = "";
}


function insertDay(){
  let modal = document.getElementById("modal-insert-day");
  modal.style.display = "block";
  let input = modal.querySelector("input");
  input.value = "";
};

function deleteDay(){
  let modal = document.getElementById("modal-delete-day");
  modal.style.display = "block";
  let input = modal.querySelector("input");
  input.value = "";
};

function deleteModalDay(){

  const modal = document.getElementById("modal-delete-day");

  let index   = modal.querySelector("input").value;
  let doc     = document.getElementById('myItinerary');
  let days    = doc.getElementsByClassName('containers');
  let label   = modal.querySelector("label");

  if (isNaN(index) || index < 1 || index > days.length) {
    label.innerHTML = '<div class="alert">Input not valid</div>';
  } else {   
    modal.style.display = "none";
    saveItinerary(index-1);
  };
};

function saveModalDay(){

  const modal = document.getElementById("modal-insert-day");

  let div;
  let index   = modal.querySelector("input").value;
  let doc     = document.getElementById('myItinerary');
  let days    = doc.getElementsByClassName('containers');
  let label   = modal.querySelector("label");

  if (isNaN(index) || index < 1 || index > days.length) {
    label.innerHTML = '<div class="alert">Input not valid</div>';
  } else {

    for (let i = days.length; i > index; i--) {
      days[i] = days[i-1];
    };

    div = document.createElement('div');
    div.className = "containers";
    div.innerText = "\n";
    days[index].parentNode.insertBefore(div, days[index]);

    modal.style.display = "none";
    saveItinerary();
  };
};

function editItem(obj){

  /* 
  // Do close modal when clicking outside the modal range 

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  } 
  */

  const day   = obj.getAttribute("day");
  const index = obj.getAttribute("index");
  const url   = obj.getAttribute("url");
  const type  = obj.getAttribute("type");

  var count = (url.match(/\//g) || []).length;

  var modal = document.getElementById("modal-"+type);
  if (type == 'transfer'){
    modal = document.getElementById("modal-excursion");
  };
  modal.style.display = "block";

  var defaultBtn= modal.querySelector(".default-modal-btn");
  if (url.includes("{{ htmlUnescape .RelPermalink }}")){
    defaultBtn.style.display = "block"
  } else {
    defaultBtn.style.display = "none"
  }

  let modalURL          = modal.getElementsByClassName('modal-url');
  let displayURL        = url.split("/");
  modalURL[0].innerText = displayURL[displayURL.length-2];

  let title             = obj.getElementsByClassName('title');
  let modalTitle        = modal.getElementsByClassName('modal-title');
  modalTitle[0].value   = title[0].innerText;

  let rows              = modal.getElementsByClassName('row');
  rows[0].children[0].innerHTML = '<i class="icon-'+type+'"></i>';

  let content           = obj.getElementsByClassName('content-details');
  let modalContent      = modal.getElementsByClassName('content');
  modalContent[0].value = content[0].innerText;
  rows[1].children[0].style.height = 'auto';
  const height          = rows[1].children[0].scrollHeight;
  rows[1].children[0].style.height = height + 'px';

  let inputs      = modal.getElementsByClassName('input');
  inputs[0].day   = day;
  inputs[0].index = index;
  inputs[0].url   = url;

  let data = obj.getElementsByClassName('details');
  for(let i=0;i<inputs.length;i++) {
    if (data[i]) {
      inputs[(i)].value = data[i].innerHTML;
    }
  } 
};

function copyToTours(){

  const source = document.querySelector("#region");
  const region = source[source.selectedIndex].value ;

  var from = host[2];
  var to   = region

  docLoad({
        url:    'copytotours',
        method: 'POST', 
        apphost: '{{ .Site.Params.appHost }}', 
        data: JSON.stringify({
          "from": from,
          "to": to
        })
      })
      .then(

      function(response){
        alert("Copied "+from+" to "+to);
      }, 
      function(Error) {
        alert(Error);
        console.log(Error);
      });

};

window.onload = fadeAlert();


/* =============== SELECT ITEMS ============ */

