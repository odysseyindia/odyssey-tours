/* Google Maps */
map = new google.maps.Map(document.getElementById('gmap'), {
  center: {lat: {{ .Params.longitude }}, lng: {{ .Params.latitude }} },
  zoom: 8
});