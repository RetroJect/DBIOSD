/*
 ____
|,--.| Created by:
||__|| Grayson Doshier
|+  o| 
|,'o | Language: Javascript
`----' 

Purpose: Downloads Dell BIOS files specified from an input file

Repository: https://github.com/RetroJect/DBIOSD

Creation Date: 6/27/2019

Modified Date: 7/3/2019

*/


// -============ Includes =============-
const cheerio = require('cheerio'); // HTML Parser like jQuery
const request = require('request'); // Downloads web pages
const download = require('download-file'); // Downloads a file
const fs = require('fs'); // Access the filesystem
const parse = require('csv-parse/lib/sync'); // Parses CSV files in a synchronous manner
const winston = require('winston'); // A detailed logging tool


// -============ Variables ==============-
var base = "http://downloads.dell.com/published/pages/"
var base_link = "http://downloads.dell.com/published/Pages/index.html";
var base_page; // Holds the info for the main page

var file = ''; // Collected data from the CSV file
var file_name = 'models.csv'; // Default file to open

var models = []; // Array of computer models to search for
var cur_page; // The DOM of the currently downloaded page

// Describes the logger for the program
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'MM-DD-YYYY HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'bios-downloader' },
  transports: [
    // Only contains error level messages
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Contains all log messages
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// If not in the 'Production' environment, also log to stdout
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// -============ Functions ==============-
function get_pages(body) {
  const $ = cheerio.load(body);
  // console.log('[STATUS] Searching for models...');
  logger.info('Searching for computer models...')
  // Gets detail page links from model names
  for (model in models) {
    $('a').filter(function (i, el) {
      if ($(this).text() == models[model][0]) {
        var link = base + $(this).attr('href'); // Create the full link
        var name = models[model][0];
        // Requests the details page for a computer model
        request(link, (error, response, body) => {
          if (error) {
            // console.log('error:', error);
            logger.error('Bad Request:', error);
            // console.log('statusCode:', response && response.statusCode);
            logger.error('Bad Request Status:', { res: response, status: response.statusCode });
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
  // console.log('[STATUS] Now downloading latest BIOS for ' + name);
  logger.info('Downloading latest BIOS for %s', name);
  var dir = './BIOS/' + name;
  download(link, { directory: dir }, (error) => {
    if (error) {
      // console.log(error);
      logger.error('Bad Download:', error);
    } else {
      // console.log('[STATUS] Finished downloading to '+dir);
      logger.info('Downloaded BIOS file to %s', dir);
    }
  });
}


// -============ Main ==============-

// Checks for command line arguments
if(process.argv.length > 2){
  file_name = process.argv[2]; // Sets the filename used
}

// Gets the Computer Models from a specified file
try {
  file = fs.readFileSync(file_name);
} catch (error) {
  // console.error("[ERROR] Something went wrong opening the file: "+file_name);
  logger.error('Failed to open %s', file_name, { fs_error: error });
  // console.error('[FS Error] '+error);
  process.exit(2); // Filesystem error
}

// Attempts to parse the CSV file
try {
  models = parse(file, {
    skip_empty_lines: true,
    skip_lines_with_error: true,
    columns: false,
    objectMode: false
  });
} catch (error) {
  logger.error('Failed to parse %s', file_name, { parser: error });
  process.exit(3); // Parsing Error
}

// Checks to make sure there is at least one computer specified
if (models.length <= 0) {
  // console.log('No computer models specified! Exiting...');
  logger.error('Parsing %s returned an empty list!', file_name);
  process.exit(1); // No Computer Models specified
}

// console.log('[STATUS] Getting full list of Dell Models...');
logger.info('Getting the full list of Dell Models')
request(base_link, (error, response, body) => {
  if (error) {
    // console.log('error:', error);
    logger.error('Bad Request:', error);
    // console.log('statusCode:', response && response.statusCode);
    logger.error('Bad Request Status:', { res: response, status: response.statusCode });
  }
  // console.log('[STATUS] List collected, finding computers...');
  logger.info('Full list collected, searching for models');
  get_pages(body);

  // console.log('[STATUS] Finished!');
  // logger.info('Finished downloading all BIOS files');
});