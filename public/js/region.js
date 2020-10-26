// regions
  var locations = [
  [26.92555556, 75.82361111, '/image_1.png', '/regions/rajasthan-and-the-north/'],
  [32.28555556, 77.16222222, '/image_2.png', '/regions/foothills-of-the-himalaya/'],
  [24.63750000, 87.84861100, '/image_3.png', '/regions/kolkata-and-the-east/'],
  [23.02166667, 72.59027778, '/image_4.png', '/regions/gujarat-and-central-india/'],
  [18.999803, 72.817383,     '/image_5.png', '/regions/mumbai-goa-and-the-deccan/'],
  [13.05027778, 80.23222222, '/image_6.png', '/regions/karnataka-and-tamil-nadu/'],
  [8.36944444, 77.00444444,  '/image_7.png', '/regions/kerala/'],
  [11.63722222, 92.72805556, '/image_8.png', '/regions/andaman-and-nicobar-islands/'],
  [10.951111, 72.287778,     '/image_9.png', '/regions/the-lakshadweep-islands/'],
  ];

  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: new google.maps.LatLng(23.268764, 81.474609),
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      mapTypeControl: false,
      streetViewControl: false,
      panControl: false,
      scrollwheel: false,
      navigationControl: false,
      scaleControl: false,
      draggable: false,
      disableDefaultUI: true,
    });

    var gmarkers = new Array();

    for (var i = 0; i < locations.length; i++) { 

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][0], locations[i][1]),
        map: map,
        icon: '/markers/' + locations[i][2],
        url: locations[i][3]
      });

      gmarkers.push(marker);

      google.maps.event.addListener(marker, 'click', function() {
        window.location.href = this.url;
      });
    };
  };
