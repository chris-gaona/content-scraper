var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var url = "http://www.shirts4mike.com/";

function scrape(req, res) {
  'use strict';

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

    res.end('Consider yourself scraped!');
  }
}

module.exports.scrape = scrape;
