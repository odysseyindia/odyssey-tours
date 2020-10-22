var valueRating;
var citySelected = "Show all";

function cityFunction(selector) {
  citySelected = selector.options[selector.selectedIndex].text;
  refreshHotels();
};

const ratingRanges = document.querySelectorAll(".sliderRating");

ratingRanges.forEach(wrap => {
  const range  = wrap.querySelector(".range");
  const bubble = wrap.querySelector(".bubble");

  range.addEventListener("input", () => {
    valueRating = setBubbleHotels(range, bubble);
    refreshHotels(); 
  });
  valueRating = setBubbleHotels(range, bubble);
   refreshHotels(); 
});


function refreshHotels(){
  var article, i; 
  var numHotels = 0;

  article = document.querySelectorAll("article");
    
  for (i = 0; i < article.length; i++) {
     
    var rating = article[i].attributes.dataRating.value;  
    var city   = article[i].attributes.city.value;  

    if ( +rating < +valueRating || (citySelected != city && citySelected != "Show all") ) {
      article[i].style.display = "none";
    } else {
       article[i].style.display = "flex";
       numHotels += 1;
    }  
  }
  
  document.getElementById("numHotels").innerHTML = numHotels;
};

function setBubbleHotels(range, bubble) {
  const val = range.value;
  const min = range.min ? range.min : 0;
  const max = range.max ? range.max : 100;
  const newVal = Number(((val - min) * 100) / (max - min));
  bubble.innerHTML = val;

  // Sorta magic numbers based on size of the native UI thumb
  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;

   if (val == min || val == max) {
    bubble.style.opacity = 0;
  } else {
    bubble.style.opacity = 1;
  }
  return val;
}