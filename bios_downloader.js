/*-=========================-
 ____
|,--.| Created by:
||__|| Grayson Doshier
|+  o| 
|,'o | Language: Javascript
`----' 

Purpose: Downloads Dell BIOS files specified from an input file

Repository: https://github.com/RetroJect/DBIOSD

Creation Date: 6/27/2019

Modified Date: 7/11/2019

-=========================-*/


// -============ Includes =============-
const cheerio = require('cheerio'); // HTML Parser like jQuery
const winston = require('winston');
const request = require('request'); // Downloads web pages
const download = require('download-file'); // Downloads a file
const fs = require('fs'); // Access the filesystem
const parse = require('csv-parse/lib/sync'); // Parses CSV files in a synchronous manner
const path = require('path');

// -============ Variables ==============-

var base = "http://downloads.dell.com/published/pages/"
var base_link = "http://downloads.dell.com/published/Pages/index.html";
var base_page; // Holds the info for the main page

var logger;
var window;

var file = ''; // Collected data from the CSV file
var file_name = 'models.csv'; // Default file to open

var dir = '.'; // The parent directory to download files

var models = []; // Array of computer models to search for
var cur_page; // The DOM of the currently downloaded page

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
  // Gets the link for the .exe file
  var ext = $(cur_page).find('a').eq(1).attr('href');
  // Checks if the page has two links in the last cell and takes only the .exe
  if(ext.includes('.txt')){
    ext = $(cur_page).find('a').eq(2).attr('href');
  }
  var link = "http://downloads.dell.com" + ext;
  // console.log('[STATUS] Now downloading latest BIOS for ' + name);
  logger.info('Downloading latest BIOS for %s', name);
  var cur_dir = path.join(dir, 'BIOS', name); // Creates the download directory of base/BIOS/model
  download(link, { directory: cur_dir }, (error) => {
    if (error) {
      // console.log(error);
      logger.error('Bad Download for %s: %s, %s',name, error, link);
      window.webContents.send('update-progress'); // Tells the progress bar to update
      window.webContents.send('update-status', '[ERROR] '+'Bad Download for'+name+'. Check error.log');
    } else {
      // console.log('[STATUS] Finished downloading to '+dir);
      logger.info('Downloaded BIOS file to %s', cur_dir);
      window.webContents.send('update-status', '[STATUS] Downloaded BIOS file to '+cur_dir);
      window.webContents.send('update-progress'); // Tells the progress bar to update
    }
  });
}

// -============ Exports ==============-

exports.startLog = function() {
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

  return logger;
}

exports.download = function(log, win, file_path, dir_path) {

  logger = log;
  file_name = file_path;
  console.log('file_name: ',file_name);
  dir = path.normalize(dir_path[0]);
  console.log('dir: ',dir);
  window = win;

  // Gets the Computer Models from a specified file
  try {
    file = fs.readFileSync(file_name);
  } catch (error) {
    // console.error("[ERROR] Something went wrong opening the file: "+file_name);
    logger.error('Failed to open %s', file_name, { fs_error: error });
    // console.error('[FS Error] '+error);
    let obj = {
      status: 'Failed',
      error: 'Unabled to open input file "'+file_name+'"'
    }
    return obj;
  }

  // Attempts to parse the CSV File
  try {
    models = parse(file, {
      skip_empty_lines: true,
      skip_lines_with_error: true,
      columns: false,
      objectMode: false
    });
  } catch (error) {
    logger.error('Failed to parse %s', file_name, { parser: error });
    let obj = {
      status: 'Failed',
      error: 'Unable to parse CSV file'
    }
    return obj;
  }

  // Checks to make sure there is at least one computer specified
  if (models.length <= 0) {
    // console.log('No computer models specified! Exiting...');
    logger.error('Parsing %s returned an empty list!', file_name);
    let obj = {
      status: 'Failed',
      error: 'The CSV returned an empty list'
    }
    return obj;
  }

  // Initializes the download progress bar
  window.webContents.send('set-progress', models.length);

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
  });
}