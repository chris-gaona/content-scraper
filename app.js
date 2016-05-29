//require/import the HTTP module
var http = require('http');

//define a port to listen to
const PORT=3000;

//this function handles requests and sends responses
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}

//create a server
var server = http.createServer(handleRequest);

//start the server
server.listen(PORT, function(){
    //callback triggered when server is successfully listening.
    console.log("Server listening on: http://localhost:%s", PORT);
});
