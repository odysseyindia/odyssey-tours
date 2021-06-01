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
      }
    };

    request.onerror = function() {
      reject(Error('There was a network error.'));
    };
    
    request.send(JSON.stringify(object));
  });
};