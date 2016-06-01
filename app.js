(function() {

  'use strict';

  //require/import needed modules
  var colors = require('colors'); //colors is used to add color to console
  var http = require('http'); //http is used to create node.js server
  var scraper = require('./js/scraper.js'); //scraping functions

  //define a port to listen to
  var PORT=3000;

  //this function handles requests and sends responses
  function handleRequest(req, res) {
    scraper.scrape(req, res);
  }

  //create server
  var server = http.createServer(handleRequest);

  //start the server
  server.listen(PORT, function(){
    // callback triggered when server is successfully listening.
    console.log(colors.rainbow("Server listening on: http://localhost:" + PORT));
  });

})();
