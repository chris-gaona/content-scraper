(function() {

  'use strict';

  //require/import the HTTP module
  var http = require('http');
  var scraper = require('./scraper.js');

  //define a port to listen to
  var PORT=3000;

  //this function handles requests and sends responses
  function handleRequest(req, res) {
    scraper.scrape(req, res);
  }

  //create a server
  var server = http.createServer(handleRequest);

  //start the server
  server.listen(PORT, function(){
    // callback triggered when server is successfully listening.
    console.log("Server listening on: http://localhost:%s", PORT);
  });

})();
