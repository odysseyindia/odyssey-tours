export default function docLoad(object) {

  return new Promise(function(resolve, reject) {

    var host = ((object.method == 'POST')? object.appHost : "") + object.url;

    var request = new XMLHttpRequest();
    request.open(object.method || "GET", host);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {
      if (request.status === 200) {
        resolve(request.response);
      } else {
        reject(Error('Document requested did not load successfully; error code:' + request.statusText));
        console.log(`Error ${request.status}: ${request.statusText}`);
      }
    };

    request.onerror = () => {
      console.log('There was a network error. Restart the App server and try again.');
      var element = document.getElementById('alert-danger');
      element.style.display = 'flex';
      element.childNodes[3].innerHTML = '<strong>Network error:</strong> Restart the app server on '+object.appHost+' and try again.';
    }

    request.send(JSON.stringify(object));
  });
};