
/** A module. Its name is module:scraper.
 * @module scraper
 */
'use strict';

/** require/import needed modules */
/** colors is used to add color to console */
/**
* Requires colors npm module
* @requires colors
*/
var colors = require('colors');
/** file system */
/**
* Requires fs module
* @requires fs
*/
var fs = require('fs');
/**
* I chose Cheerio as my scraper because
* 1.) Cheerio has a fairly recent publishing (4 months)
* 2.) Cheerio has a lot of downloads, which means a lot of people are using it
* 3.) Cheerio implements a subset of core jQuery, which is very familiar syntax
* 4.) Cheerio can parse nearly any HTML or XML document
*/
/**
* Requires cheerio npm module
* @requires cheerio
*/
var cheerio = require('cheerio'); /** web scraper */
/**
* I chose Request because
* 1.) Request makes it very simple to make a request to a specified url
* 2.) Request interacts well with cheerio
* 3.) Request also has been published very recently (a month)
* 4.) Request has a lot of people using it
*/
/**
* Requires request npm module
* @requires request
*/
var request = require('request'); /** request module to get url */
/**
* I chose json2csv as my module to create a csv file because
* 1.) json2csv has a very recent publishing (2 weeks)
* 2.) json2csv has lots of people using it
* 3.) json2csv has only 3 open issues on github
* 4.) json2csv is easy to use...you mainly just have to add the data as an
* array of json objects & then add an array of objects/strings to create
* the headers in the csv file
*/
/**
* Requires json2csv npm module
* @requires json2csv
*/
var json2csv = require('json2csv');

// define other variables
var url = 'http://www.shirts4mike.com/';
var productArray = [];

/**
* checks to see if passed in argument exists in the file system
* @function
* @param {string} filePath - path of file in directory to check
* @returns {boolean} returns true or false
*/
function fileExists (filePath) {
  try {
    var stats = fs.statSync(filePath);
    /** return true if stats is directory */
    return stats.isDirectory();
  } catch (err) {
    /** return false if does not exist */
    return false;
  }
}

/**
* creates a new date string using the required format
* @function
* @returns {string} returns today's date in the required format
*/
function todaysDate () {
  /** creates new date time stamp */
  var today = new Date();
  // year
  var yyyy = today.getFullYear();
  // month
  var mm = today.getMonth() + 1;
  // day
  var dd = today.getDate();
  // format date specified in instructions: 2016-01-29.csv
  var newToday;
  // adds zero to month & day if they are less than 10
  if (mm < 10 && dd < 10) {
    newToday = yyyy + '-' + '0' + mm + '-' + '0' + dd;
  // adds zero to month if it is less than 10
  } else if (mm < 10) {
    newToday = yyyy + '-' + '0' + mm + '-' + dd;
    // adds zero to day if it is less than 10
  } else if (dd < 10) {
    newToday = yyyy + '-' + mm + '-' + '0' + dd;
  }

  // returns newToday variable
  return newToday;
}

// Gets the scraping going by calling the scrape function
scrape();

/**
* creates scrape function to start the scrape processes
* @function
*/
function scrape () {
  /** generate a folder called data if it doesn’t exist */
  if (!fileExists('data')) {
    fs.mkdir('data');
  }

  /** request visits the website http://shirts4mike.com full catalog page */
  request(url + 'shirts.php/', function (err, res, html) {
    /** if no error in request */
    if (!err && res.statusCode === 200) {
      /** passes html to cheerio to scrape */
      var $ = cheerio.load(html);
      /** for each list item in full catalog page */
      $('ul.products li').each(function () {
        /** gets product url for each list item */
        var productURL = $(this).find('a').attr('href');
        /**
        * following function scrapes product pages & passes in url as the
        * argument
        */
        scrapeProductPage(productURL);
      });

      // creates today date value in proper format by calling todaysDate function
      var todayDateValue = todaysDate();

      // give feedback in the console
      console.log(colors.green('The csv file data/' + todayDateValue + '.csv was successfully saved!'));
    } else {
      /**
      * if the site is down, an error message describing the issue
      * should appear in the console.
      */
      console.log('ERROR: ' + err.message);
      console.log(colors.red('Sorry, there was a problem scraping the page you requested.'));

      /** creates new date time stamp */
      var todayDate = new Date();
      /** creates error message to add to log file */
      var errorMessage = '[' + todayDate + '] ' + err.message + '\n';

      /**
      * when an error occurs log it to a file scraper-error.log
      * appends to the bottom of the file with a time stamp and error
      */
      fs.appendFile('scraper-error.log', errorMessage, function (err) {
        if (err) throw err;
        console.log(colors.green('The error data was appended to the scraper-error.log file!'));
      });
    } /** if statment */
  }); /** request method */
} /** scrape() */

/**
* creates function to scrape product pages & passes in url as argument
* @function
* @param productURL {string} - url to pass as an argument
*/
function scrapeProductPage (productURL) {
  /** creates new date time stamp */
  var today = new Date();
  /** converts date time stamp to string for putting in csv file */
  var dateString = today.toString();

  /** request follows links to each t-shirt page using */
  request(url + productURL, function (err, res, html) {
    /** if no error in request */
    if (!err && res.statusCode === 200) {
      // passes html to cheerio to scrape
      // scraper gets the price, title, url & image url from the product page
      // & creates an object for each product page
      var $ = cheerio.load(html);
      /** product info object
      * @name productInfo
      */
      var productInfo = {
        Title: $('title').html(),
        Price: $('.price').html(),
        ImageURL: $('img').attr('src'),
        URL: url + productURL,
        Time: dateString
      };

      // pushes each productInfo object into the product array
      productArray.push(productInfo);

      // creates today date value in proper format by calling todaysDate function
      var newToday = todaysDate();

      // column headers should be in in this order Title, Price,
      // ImageURL, URL and Time. Time should be the current date time of
      // when the scrape happened

      // creates fields/headers to be added to csv file
      var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

      // uses a third party npm package to create a CSV file
      json2csv({data: productArray, fields: fields}, function (err, csv) {
        if (err) console.log(err);

        // writes to proper file, overwriting what is there, if anything
        fs.writeFile('./data/' + newToday + '.csv', csv, function (err) {
          if (err) throw err;
        });
      });
    } else {
      /**
      * if the site is down, an error message describing the issue
      * should appear in the console.
      */
      console.log('ERROR: ' + err.message);
      console.log(colors.red('Sorry, there was a problem scraping the page you requested.'));
    }
  });
}
