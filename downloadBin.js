'use strict';

const fs = require('fs');
const https = require('https');

const BINARY_NAME = require('./fetch').BINARY_NAME;
const BASE_URL = 'https://github.com/gruntwork-io/fetch/releases/download/';
const FETCH_VERSION = 'v0.1.1';
const DOWNLOAD_URL = BASE_URL + FETCH_VERSION + '/' + BINARY_NAME;


function downloadBin(callback) {
  function hasError(err) {
    fs.unlink(BINARY_NAME);
    if (callback) {
      callback(err.message);
    }
  }

  const file = fs.createWriteStream(BINARY_NAME);
  return https.get(DOWNLOAD_URL, function(redirect_response) {
    https.get(redirect_response.headers['location'], function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(callback);
      });
    }).on('error', hasError);
  }).on('error', hasError);
}

function downloadBinIfNeeded() {
  if (!fs.existsSync(BINARY_NAME)) {
    downloadBin()
  }
}

downloadBinIfNeeded();
