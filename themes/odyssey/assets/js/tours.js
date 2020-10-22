
// slider for tours

const costRanges = document.querySelectorAll(".sliderCost");
var filter = 'cost';
var valueCost, valueDuration;

costRanges.forEach(wrap => {
  const range = wrap.querySelector(".range");
  const bubble = wrap.querySelector(".bubble");

  range.addEventListener("input", () => {
    valueCost = setBubble(range, bubble);
    refresh(); 
  });
  valueCost = setBubble(range, bubble);
   refresh(); 
});

const durationRanges = document.querySelectorAll(".sliderDuration");
filter = 'duration';

durationRanges.forEach(wrap => {
  const range = wrap.querySelector(".range");
  const bubble = wrap.querySelector(".bubble");

  range.addEventListener("input", () => {
    valueDuration = setBubble(range, bubble);
    refresh(); 
  });
  valueDuration = setBubble(range, bubble);
   refresh(); 
});

function refresh(){
  var article, i;
  var numTours = 0;
  
  article = document.querySelectorAll("article");
    
  for (i = 0; i < article.length; i++) {
     
    var cost = article[i].attributes.dataCost.value;  
    var duration = article[i].attributes.dataDuration.value;

    if ( +cost > +valueCost  ||  +duration > +valueDuration ) {
      article[i].style.display = "none";
    } else {
       article[i].style.display = "flex";
       numTours += 1;
    }  
  }
  document.getElementById("numTours").innerHTML = numTours;
};

function setBubble(range, bubble) {
  const val = range.value;
  const min = range.min ? range.min : 0;
  const max = range.max ? range.max : 100;
  const newVal = Number(((val - min) * 100) / (max - min));
  bubble.innerHTML = val;

  // Sorta magic numbers based on size of the native UI thumb
  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;

   if (val == min || val == max ) {
    bubble.style.opacity = 0;
  } else {
    bubble.style.opacity = 1;
  }
  return val;
}
