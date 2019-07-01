/*
 ____
|,--.| Created by:
||__|| Grayson Doshier
|+  o| 
|,'o | Language: Javascript
`----' 

Purpose: Downloads Dell BIOS files specified from an input file

Creation Date: 6/27/2019

Modified Date: 7/1/2019

*/


// -============ Includes =============-
const cheerio = require('cheerio'); // HTML Parser like jQuery
const request = require('request'); // Downloads web pages
const download = require('download-file'); // Downloads a file
const fs = require('fs'); // Access the filesystem
const parse = require('csv-parse/lib/sync'); // Parses CSV files


// -============ Variables ==============-
var base = "http://downloads.dell.com/published/pages/"
var base_link = "http://downloads.dell.com/published/Pages/index.html";
var base_page; // Holds the info for the main page

var file = '';
var file_name = 'models.csv'; // Default file to open

var models = []; // Array of computer models to search for
var cur_page; // The DOM of the currently downloaded page

// -============ Functions ==============-
function get_pages(body) {
  const $ = cheerio.load(body);
  console.log('[STATUS] Searching for models...');
  // Gets detail page links from model names
  for (model in models) {
    $('a').filter(function (i, el) {
      if ($(this).text() == models[model][0]) {
        var link = base + $(this).attr('href'); // Create the full link
	var name = models[model][0];
        // Requests the details page for a computer model
        request(link, (error, response, body) => {
          if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
          }
          // Starts the download process
          download_file(body, name);
        });
      }
    });
  }
}

function download_file(page, name) {
  const $ = cheerio.load(page);
  // Find the BIOS Table
  cur_page = $('#Drivers-Category\\.BI-Type\\.BIOS').children('table').children('tbody').children('tr');
  // Gets the second link in the table
  var link = "http://downloads.dell.com" + $(cur_page).find('a').eq(1).attr('href');
  console.log('[STATUS] Now downloading latest BIOS for ' + name);
  var dir = './BIOS/' + name;
  download(link, {directory: dir}, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('[STATUS] Finished downloading to '+dir);
    }
  });
}


// -============ Main ==============-
// Gets the Computer Models from a specified file
try{
  file = fs.readFileSync(file_name);
} catch (error) {
  console.error("[ERROR] Something went wrong opening the file: "+file_name);
  console.error('[FS Error] '+error);
  process.exit(2); // Filesystem error
}

models = parse(file, {
  skip_empty_lines: true,
  skip_lines_with_error: true,
  columns: false,
  objectMode: false
});

if(models.length <= 0){
  console.log('No computer models specified! Exiting...');
  process.exit(1);
}
console.log('[STATUS] Getting full list of Dell Models...');
request(base_link, (error, response, body) => {
  if (error) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
  }
  console.log('[STATUS] List collected, finding computers...');
  get_pages(body);
});
console.log('[STATUS] Finished!');
