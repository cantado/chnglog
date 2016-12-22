'use strict';

var EventEmitter = require('events');
var cmd = require('./cmd');

function base (commands) {
  if (!commands) {
    throw new TypeError('No commands given.');
  }

  function getTags () {
    return cmd(commands.tags);
  }

  function getTagTimestamp (opt) {
    return cmd(commands.tagTimestamp, opt);
  }

  function getTagCommit (item, opt) {
    return cmd(commands.tagCommits, item, opt);
  }

  return {
    getTags: getTags,
    getTagTimestamp: getTagTimestamp,
    getTagCommit: getTagCommit
  };

}

module.exports = base;
