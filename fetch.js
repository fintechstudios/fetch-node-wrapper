'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const PLATFORM_RELEASE_MAP = {
  'darwin': 'fetch_darwin_%ARCH',
  'freebsd': 'fetch_linux_%ARCH',
  'linux': 'fetch_linux_%ARCH',
  'win32': 'fetch_windows_%ARCH.exe'
};
const ARCH_MAP = {
  'x64': 'amd64',
  'ia32': '386'
};
const BINARY_NAME = PLATFORM_RELEASE_MAP[process.platform].replace('%ARCH', ARCH_MAP[process.arch]);
const BINARY_PATH = path.join(__dirname, BINARY_NAME);


function create_command(options, local_download_path) {
  let command = BINARY_PATH;
  for (const key in options) {
    if (!options.hasOwnProperty(key)) {
      continue;
    }
    let option = (key.startsWith('--') ? key : '--' + key);
    let choices = options[key];

    if (!choices) {  // option might be a flag with no value, like --help
      command += ' ' + option;
    }
    else {
      // some options can be given multiple times, like --source-path
      // we give the option to pass these as an array or comma-separated string
      if (!Array.isArray(choices)) {
        choices = choices.split(',');
      }
      for (let i = 0, choice; i < choices.length; i++) {
        choice = choices[i];
        command += ' ' + option + '="' + choice + '"';
      }
    }
  }
  return command + ' ' + local_download_path;
}


function fetch(options, local_download_path, callback) {
  const cmd = create_command(options, local_download_path);

  const child = child_process.exec(cmd, callback);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return child;
}

function fetchSync(options, local_download_path) {
  const cmd = create_command(options, local_download_path);

  return child_process.execSync(cmd, {
    env: Object.create(process.env),
    stdio: 'inherit'
  })
}


const Fetch = {
  BINARY_NAME: BINARY_NAME,
  BINARY_PATH: BINARY_PATH,
  fetch: fetch,
  fetchSync: fetchSync
};
module.exports = Fetch;