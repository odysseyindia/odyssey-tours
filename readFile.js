var fs = require("fs")

fs.readFile('greetings.txt', 'utf8', function (err, data) {
  fs.writeFile('writeMe.txt', data, function(err, result) {
     if(err) console.log('error', err);
   });
 });