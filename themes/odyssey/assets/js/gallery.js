/*| gallerry modal */
$(document).ready(function(){
var modalLandscape = document.getElementById('landscapeModal');
var imagesLandscape = document.getElementsByClassName('landscape');
var modalImgLandscape = document.getElementById("landscape");
var captionTextLandscape = document.getElementById("caption");

for (var i = 0; i < imagesLandscape.length; i++) {
  var imgLandscape = imagesLandscape[i];

  imgLandscape.onclick = function(evt) {
    modalLandscape.style.display = "block";
    modalImgLandscape.src = this.src;
    captionTextLandscape.innerHTML = this.alt;
  }
}

var spanLandscape = document.getElementsByClassName("close-landscape")[0];
spanLandscape.onclick = function() {
  modalLandscape.style.display = "none"; 
}

modalImgLandscape.onclick = function() {
  modalLandscape.style.display = "none";
}

/* portrait */
var modalPortrait = document.getElementById('portraitModal');
var imagesPortrait = document.getElementsByClassName('portrait');
var modalImgPortrait = document.getElementById("portrait");
var captionTextPortrait = document.getElementById("captionP"); 

for (var i = 0; i < imagesPortrait.length; i++) {
  var imgPortrait = imagesPortrait[i];

  imgPortrait.onclick = function(evt) {
    modalPortrait.style.display = "block";
    modalImgPortrait.src = this.src;
    captionTextPortrait.innerHTML = this.alt;
  }
}

var spanPortrait = document.getElementsByClassName("close-portrait")[0];
spanPortrait.onclick = function() {
  modalPortrait.style.display = "none";
}

modalImgPortrait.onclick = function() {
  modalPortrait.style.display = "none";
}
});