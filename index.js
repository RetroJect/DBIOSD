/*-=========================-
 ____
|,--.| Created by:
||__|| Grayson Doshier
|+  o| 
|,'o | Language: Javascript
`----' 

Purpose: The entry point of the main program

Repository: https://github.com/RetroJect/DBIOSD

Creation Date: 7/8/2019

Modified Date: 7/11/2019

-=========================-*/

const electron = require('electron');
const downloader = require('./bios_downloader');
const path = require('path');

const logger = downloader.startLog();

let mainWin; // The main BrowserWindow object
var file; // The path to the input file
var output; // The path to the output directory

function createMain(){
  mainWin = new electron.BrowserWindow({
    minWidth: 400,
    width: 800,
    minHeight: 350,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    },
    title: 'Downloader',
    icon: path.join(__dirname,'assets','icon.png'),
    autoHideMenuBar: true
  });

  mainWin.loadFile('index.html');
  // mainWin.webContents.openDevTools();
  mainWin.on('closed', () => {
    mainWin = null;
  });
}

electron.app.on('ready', createMain);

electron.app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', () => {
  if(mainWin === null) {
    createMain();
  }
});


// Gets the file path from the Renderer process
electron.ipcMain.on('set-file', (event, arg) => {
  file = arg; // Sets the file path to the sent variable
  // console.log('Got file path from Renderer: '+arg);
  logger.info('Got file path from Renderer: '+arg);
});

// Gets the output path from the Renderer process
electron.ipcMain.on('set-dir', (event, arg) => {
  output = arg;
  // console.log('Got directory path from Renderer: '+arg);
  logger.info('Got directory path from Renderer: '+arg);
});

// Starts the download after signal from Renderer
electron.ipcMain.on('start-download', (event, arg) => {
  logger.info('Attempting to start download');
  let error = downloader.download(logger, mainWin, file, output);
  if(error){
    logger.error('Download failed, returned to main', error);
  } else {
    // If the function doesn't return an error, say that it finished
    mainWin.webContents.send('finished');
  }
})