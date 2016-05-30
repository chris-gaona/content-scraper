(function() {

  'use strict';

  var fs = require('fs');
  var cheerio = require('cheerio');
  var request = require('request');
  var json2csv = require('json2csv');

  //Use a linting tool like ESLint to check your code for syntax errors and to ensure general code quality. You should be able to run npm run lint to check your code.
  //run "npm run lint" in the console to check js code

  var url = "http://www.shirts4mike.com/";
  var productArray = [];

  function scrape(req, res) {

    if (req.url != '/favicon.ico') {
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

      if (!fileExists('data')) {
        fs.mkdir('data');
      }

      //The scraper should be able to visit the website http://shirts4mike.com and follow links to all t-shirts.
      //The scraper should get the price, title, url and image url from the product page and save it in the CSV.
      request(url + 'shirts.php/', function(err, res, html) {
        if (!err && res.statusCode == 200) {
          var $ = cheerio.load(html);
          $('ul.products li').each(function() {
            var productURL = $(this).find('a').attr('href');

            scrapeProductPage(productURL);
          });
        } else {
          //If the site is down, an error message describing the issue should appear in the console.
          console.log(err.message);
          console.log('Sorry, there was a problem scraping the page you requested.');

          //When an error occurs log it to a file scraper-error.log . It should append to the bottom of the file with a time stamp and error e.g. [Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>
          var todayDate = new Date();
          var errorMessage = "[" + todayDate + "] " + err.message + "\n";

          fs.appendFile('scraper-error.log', errorMessage, function (err) {
            if (err) throw err
            console.log('The "data to append" was appended to file!');
          });
        }
      });

      res.end('Consider ' + url + ' scraped!');
    }
  } //scrape()

  function scrapeProductPage(productURL) {
    var today = new Date();
    var dateString = today.toString();

    request(url + productURL, function(err, res, html) {
      var $ = cheerio.load(html);
      var productInfo = {
        Title: $('title').html(),
        Price: $('.price').html(),
        ImageURL: $('img').attr('src'),
        URL: url + productURL,
        Time: dateString
      }

      productArray.push(productInfo);
      console.log(productArray);

      var yyyy = today.getFullYear();
      var mm = today.getMonth()+1;
      var dd = today.getDate();
      var newToday = yyyy+'-'+mm+'-'+dd;

      //The information from the site should be stored in a CSV file with today’s day e.g. 2016-01-29.csv.
      //Use a third party npm package to create an CSV file. You should be able to explain why you chose that package.
      //The column headers should be in in this order Title, Price, ImageURL, URL and Time. Time should be the current date time of when the scrape happened. If they aren’t in this order the can’t be entered into the database of the price comparison site.
      var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

      json2csv({data: productArray, fields: fields}, function(err, csv) {
        if (err) console.log(err);

        fs.writeFile('./data/' + newToday + '.csv', csv, function(err) {
          if (err) throw err;
          console.log('File Saved!');
        });
      });
    });
  }

  module.exports.scrape = scrape;

})();
