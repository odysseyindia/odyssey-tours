window.addEventListener('error', function (e) {
  var stack = e.error.stack;
  var message = e.error.toString();

  if (stack) {
    message += '\n' + stack;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:1314/ajax', true);
  // Fire an Ajax request with error details
  xhr.send(message);
});