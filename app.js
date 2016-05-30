//require/import the HTTP module
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var url = "http://www.shirts4mike.com/";

//define a port to listen to
const PORT=3000;

//this function handles requests and sends responses
function handleRequest(req, res) {
  if (req.url != '/favicon.ico') {
    console.log(req.url);
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

    var $;
    var object;

    //The scraper should get the price, title, url and image url from the product page and save it in the CSV.
    request(url + 'shirts.php/', function(err, res, html) {
      $ = cheerio.load(html);
      $('ul.products li').each(function() {
        var productURL = $(this).find('a').attr('href');
        console.log(url + productURL);
        request(url + productURL, function(err, res, html) {
          $ = cheerio.load(html);
          console.log($('.price').html());
          object = {
            price: $('.price').html(),
            title: $('title').html(),
            url: url + productURL,
            imageURL: $('img').attr('src')
          }
          console.log(object);
        });
      });
    });

    // var xray = new Xray();
    //
    // xray(url, {
    //   first: xray('ul.products li a@href', {
    //     title: 'title',
    //     price: '.price',
    //     url: '@href'
    //   })
    // })(function(err, obj) {
    //   // console.log(err);
    //   console.log(obj);
    // });

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
}

//create a server
var server = http.createServer(handleRequest);

//start the server
server.listen(PORT, function(){
  // callback triggered when server is successfully listening.
  console.log("Server listening on: http://localhost:%s", PORT);
});
