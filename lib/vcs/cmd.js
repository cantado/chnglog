'use strict';

var child = require('child_process');

var childOptions = {
  maxBuffer: 1024 * 1024
};

function cmd (command, args, options) {
  args = args || {};
  options = options || {};

  var delimiter = options.delimiter === undefined ? /\n/ : options.delimiter;

  var cmdCommand = command
    .replace(/\{\{(\w+)\}\}\.\.\{\{(\w+)\}\}/g, function (m, from, to) {
      var value = args[to];
      if (args[from]) {
        value = args[from] + '..' + value;
      }
      return value;
    })
    .replace(/\{\{(\w+)\}\}/g, function (m, attr) {
      return args[attr] === undefined ? attr : args[attr];
    });

  var promise = new Promise(function(resolve, reject) {
    child.exec(cmdCommand, childOptions, function (err, res) {
      if (err) {
        return reject(err);
      }
      var results = (res || '').split(delimiter);
      if (results.length && !results.slice(-1)[0]) {
        results.pop();
      }
      return resolve(results);
    });
  });

  return promise;
}

module.exports = cmd;
