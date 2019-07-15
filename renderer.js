/*-=========================-
 ____
|,--.| Created by:
||__|| Grayson Doshier
|+  o| 
|,'o | Language: Javascript
`----' 

Purpose: Included in index.html

Repository: https://github.com/RetroJect/DBIOSD

Creation Date: 7/8/2019

Modified Date: 7/11/2019

-=========================-*/

/* -========== NodeJS Requires ==========- */

const Path = require('path'); // Useful filestructure stuff
const { remote, shell, ipcRenderer } = require('electron'); // Access to Elctron Main processes
const fs = require('fs'); // Access to filesystem
var pjson = require('./package.json');

/* -========== Function Definitions ==========- */

// Handles chosen input file
function handleFile(path) {
  console.log('Dropped File: ', path);
  // Sends the file path to the Main process
  ipcRenderer.send('set-file', path);

  // Gets the file name only
  var file = Path.basename(path);

  // Hides the options to choose a file
  $('#chooseFileSection').hide();
  // Shows the preview section
  $('#previewSection').transition('fade down');

  // Enables the buttons
  $('#inputStepNext').removeClass('disabled');
  $('#inputStepClear').removeClass('disabled');

  // Clears the preview
  $('#previewHeader').empty();
  $('#previewContent').empty();
  $('#preview').removeClass('placeholder');

  // Sets the preview
  $('#previewHeader').append('<h3>Preview of: \'' + file + '\'</h3>');
  fs.readFile(path, function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data) {
      $('#previewContent').append('<pre>' + data + '</pre>');
    }
  })
}

function openAboutModal() {
  $('#aboutModal').modal('show');
}

// Refreshes the page
function hardReset() {
  remote.getCurrentWindow().reload();
}

/* -========== End Function Definitions ==========- */



/* -========== Button Events ==========- */

// Transitions from Step 1 to Step 2
$('#inputStepNext').click(function () {
  // Set Step 1 as completed
  $('#inputStepTitle').removeClass('active').addClass('completed');
  // Change the view
  $('#inputStep').transition('fly right', function () {
    $('#outputStep').transition('fly left');
  });
  // Set Step 2 as active
  $('#outputStepTitle').removeClass('disabled').addClass('active');
});


// Opens a browse dialog for input
$('#inputStepBrowse').click(function () {
  // Get the window object
  var win = remote.getCurrentWindow();
  // Create an openFile dialog attached as a modal to the main window
  var file = remote.dialog.showOpenDialog(win, {
    filters: [
      { name: 'CSV', extensions: ['csv'] }
    ],
    properties: [
      'openFile'
    ]
  });
  // If a file was chosen, enable the 'next' button
  if (file) {
    handleFile(file[0]);
  }
});

// Resets the 1st page
$('#inputStepClear').click(function(){
  // Switches the two panels
  $('#previewSection').transition();
  $('#chooseFileSection').show();
  // Disables the button so you have to give a file first
  $('#inputStepNext').addClass('disabled');
  $('#inputStepClear').addClass('disabled');

  // hardReset();

  console.log('Reset Page 1!');
});

// Handles choosing the output location
$('#outputStepBrowse').click(function() {
  // The window
  var win = remote.getCurrentWindow();
  // Returns the path to the directory
  var dir = remote.dialog.showOpenDialog(win, {
    properties: [
      'openDirectory',
      'createDirectory',
      'promptToCreate'
    ]
  });
  if(dir){
    // Clears the current directory tag
    $('#currentDir').empty();
    // Sets the current directory tag
    $('#currentDir').append('Current Path: '+dir);
    // Sends the output dir path to the Main Process

    // Enables the next button
    $('#outputStepNext').removeClass('disabled');

    ipcRenderer.send('set-dir', dir);
    console.log('Output Dir: '+dir[0]);
  }
});

// Changes step to download
$('#outputStepNext').click(function(){
  // Set Step 2 as completed
  $('#outputStepTitle').removeClass('active').addClass('completed');
  // Change the view
  $('#outputStep').transition('fly right', function () {
    $('#downloadStep').transition('fly left');
  });
  // Set Step 2 as active
  $('#downloadStepTitle').removeClass('disabled').addClass('active');
  ipcRenderer.send('start-download');
});

// Quit Button closes the window
$('#downloadStepQuit').click(function(){
  if($('#downloadBar').progress('is complete')){
    remote.getCurrentWindow().close();
  } else {
    remote.dialog.showErrorBox('Please Wait', 'Please wait until all downloads have completed before quitting.');
  }
});

/* -========== End Button Events ==========- */

/* -========== Others ==========- */
// Sets up the Drag & Drop Area
var dropArea = document.getElementById('dropArea');
dropArea.ondragover = dropArea.ondrop = (ev) => {
  ev.preventDefault();
}
dropArea.ondrop = (ev) => {
  // console.log(ev.dataTransfer.files);
  var path = ev.dataTransfer.files[0].path;
  if (Path.extname(path) === '.csv') {
    handleFile(path);
  } else {
    remote.dialog.showErrorBox('File Type Error', 'Please drop only \'.csv\' files.')
  }
  ev.preventDefault();
}

// Puts the App version in the About Modal
$('#aboutVersion').append('Version: '+pjson.version);

// Initializes the About Modal
$(document).ready(function() {
  $('aboutModal').modal();
});

// Opens links in a browser, not the app
$('body').on('click', 'a', (event) => {
  event.preventDefault();
  let link = event.target.href;
  shell.openExternal(link);
});

// Initializes the download progress bar
ipcRenderer.on("set-progress", (event, arg) => {
  console.log('Got total from main: ',arg);
  // $('#downloadBar').progress('reset');
  $('#downloadBar').progress({
    value: 0,
    total: arg,
    text: {
      active: 'Downloaded {value} of {total} files',
      success: 'Finished Downloading!'
    }
  });
});

// Updates the download progress bar with every download completion
ipcRenderer.on('update-progress', (event, arg) => {
  $('#downloadBar').progress('increment');
})

// Enables Quit button on finish download
ipcRenderer.on('finished', (event, arg) => {
  $('#downloadStepQuit').removeClass('disabled');
})

ipcRenderer.on('update-status', (event, arg) => {
  $('#log').append('<li>'+arg+'</li>');
})