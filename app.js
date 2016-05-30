//require/import the HTTP module
var http = require('http');
var fs = require('fs');
var Xray = require('x-ray');

var url = "http://www.shirts4mike.com/";

//define a port to listen to
const PORT=3000;

//this function handles requests and sends responses
function handleRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  //The scraper should generate a folder called data if it doesn’t exist.
  function fileExists(filePath) {
    try {
      var stats = fs.statSync(filePath);
      return stats.isDirectory();
    }
    catch (err) {
      return false;
    }
  }
  console.log(fileExists('data'));

  if (!fileExists('data')) {
    fs.mkdir('data');
  }

  

  var xray = new Xray();

  xray(url, 'title')(function(err, title) {
    console.log(title);
  });
  console.log('yes');
  console.log(req.url);

  // fs.stat('foo.txt', function(err, stat) {
  //   if(err == null) {
  //     console.log('File exists');
  //   } else if(err.code == 'ENOENT') {
  //     // file does not exist
  //     fs.writeFile('log.txt', 'Some log\n');
  //   } else {
  //     console.log('Some other error: ', err.code);
  //   }
  // });
  res.end('Consider yourself scraped!');
}

//create a server
var server = http.createServer(handleRequest);

//start the server
server.listen(PORT, function(){
  // callback triggered when server is successfully listening.
  console.log("Server listening on: http://localhost:%s", PORT);
});
