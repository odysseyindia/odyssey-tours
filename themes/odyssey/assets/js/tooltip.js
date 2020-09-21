/*! tooltip */
function tooltip(){
  var pos = ($(window).width() < 768) ? true : false;
  if (pos === false) {
    $('[data-toggle="tooltip"]').tooltip('disable'); 
  } else{
    $('[data-toggle="tooltip"]').tooltip('enable');
  }
};