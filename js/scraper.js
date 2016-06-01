(function() {

  'use strict';

  //require/import needed modules
  var fs = require('fs'); //file system
  //I chose cheerio as my scraper because it has a fairly recent publishing
  //(4 months) & has a lot of downloads, which means a lot of people are using
  //it. I really like how cheerio uses jquery style syntax as well.
  var cheerio = require('cheerio'); //web scraper
  //I chose request because it made it very simple to make a request to a
  //specified url & it played well with cheerio. It also has been published
  //very recently (a month) & has a lot of people using it
  var request = require('request'); //request module to get url
  //I chose json2csv as my module to create a csv file because it has a very
  //recent publishing (1 week), lots of people using it, & only 3 issues on
  //github
  var json2csv = require('json2csv'); //creates csv file

  //Use a linting tool like ESLint to check your code for syntax errors
  //and to ensure general code quality.
  //You should be able to run npm run lint to check your code.
  //************************
  //run "npm run lint" in the console to check js code using JSHint
  //************************

  //define other variables
  var url = "http://www.shirts4mike.com/";
  var productArray = [];

  //checks to see if passed in argument exists
  function fileExists(filePath) {
    try {
      var stats = fs.statSync(filePath);
      //return true if stats is directory
      return stats.isDirectory();
    }
    catch (err) {
      //return false if does not exist
      return false;
    }
  }

  //creates scrape function and passes in request & response
  function scrape(req, res) {

    //prevents every http request from sending 2 requests --> 1 for data request
    //& 1 for favicon.ico file request
    if (req.url != '/favicon.ico') {
      //sends an HTTP status code and a collection of response headers
      //back to the client
      res.writeHead(200, {'Content-Type': 'text/plain'});

      //generate a folder called data if it doesn’t exist
      if (!fileExists('data')) {
        fs.mkdir('data');
      }

      //request visits the website http://shirts4mike.com full catalog page
      request(url + 'shirts.php/', function(err, res, html) {
        //if no error in request
        if (!err && res.statusCode == 200) {
          //passes html to cheerio to scrape
          var $ = cheerio.load(html);
          //for each list item in full catalog page
          $('ul.products li').each(function() {
            //gets product url for each list item
            var productURL = $(this).find('a').attr('href');
            //following function scrapes product pages & passes in url as the
            //argument
            scrapeProductPage(productURL);
          });
        } else {
          //if the site is down, an error message describing the issue
          //should appear in the console.
          console.log("ERROR: " + err.message);
          console.log('Sorry, there was a problem scraping the page you requested.');

          //creates new date time stamp
          var todayDate = new Date();
          //creates error message to add to log file
          var errorMessage = "[" + todayDate + "] " + err.message + "\n";

          //when an error occurs log it to a file scraper-error.log
          //appends to the bottom of the file with a time stamp and error
          fs.appendFile('scraper-error.log', errorMessage, function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to the file!');
          });
        } //if statment
      }); //request method

      //tells the server that the response headers & body have been sent
      //request has been fulfilled
      res.end('Consider ' + url + ' scraped!');
    } //if favicon statement
  } //scrape()

  //creates function to scrape product pages & passes in url as argument
  function scrapeProductPage(productURL) {
    //creates new date time stamp
    var today = new Date();
    //converts date time stamp to string for putting in csv file
    var dateString = today.toString();

    //request follows links to each t-shirt page using
    request(url + productURL, function(err, res, html) {
      //passes html to cheerio to scrape
      var $ = cheerio.load(html);
      //scraper gets the price, title, url & image url from the product page
      //& creates an object for each product page
      var productInfo = {
        Title: $('title').html(),
        Price: $('.price').html(),
        ImageURL: $('img').attr('src'),
        URL: url + productURL,
        Time: dateString
      };

      //pushes each productInfo object into the product array
      productArray.push(productInfo);

      //year
      var yyyy = today.getFullYear();
      //month
      var mm = today.getMonth()+1;
      //day
      var dd = today.getDate();
      //format date specified in instructions: 2016-01-29.csv
      var newToday = yyyy+'-'+mm+'-'+dd;

      //column headers should be in in this order Title, Price,
      //ImageURL, URL and Time. Time should be the current date time of
      //when the scrape happened

      //creates fields/headers to be added to csv file
      var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

      //uses a third party npm package to create a CSV file
      json2csv({data: productArray, fields: fields}, function(err, csv) {
        if (err) console.log(err);

        //writes to proper file, overwriting what is there, if anything
        fs.writeFile('./data/' + newToday + '.csv', csv, function(err) {
          if (err) throw err;
          //give feedback in the console
          console.log('File Saved!');
        });
      });
    });
  }

  //exports this module to be called in app.js
  module.exports.scrape = scrape;

})();
