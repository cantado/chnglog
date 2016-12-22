'use strict';

function isArray (value) {
  return Array.isArray(value);
}

function isObject (value) {
  return typeof value === 'object';
}

function assign () {
  var args = Array.prototype.slice.call(arguments);
  var base = args.shift() || {};
  while (args.length) {
    var obj = args.shift();
    if (!isObject(obj)) {
      continue;
    }
    for (var key in obj) {
      if (isObject(obj[key]) && isObject(base[key])) {
        assign(base[key], obj[key]);
        continue;
      }
      base[key] = typeof obj[key] === 'undefined' ? base[key] : obj[key];
    }
  }
  return base;
}

function normalizeUrl (url) {
  if (typeof url !== 'string') {
    return '';
  }
  url = url.split(/\?#/)[0];
  if (url.slice(-1) === '/') {
    url = url.slice(0, -1);
  }
  return url;
}

function sortBy(arr, attr, order) {
  var asc = function (a,b) {
    if (a > b) { return 1; }
    if (a < b) { return -1; }
    return 0;
  };
  var desc = function (a,b) {
    if (a < b) { return 1; }
    if (a > b) { return -1; }
    return 0;
  };
  var sortMethod = (order || 1) < 0 ? desc : asc;
  return arr.sort(function (a, b) {
    return sortMethod(a[attr], b[attr]);
  });
}

function groupBy (arr, attr) {
  return arr.reduce(function (groups, item) {
    var value = item[attr] + '';
    var index = groups.findIndex(function (group, index, array) {
      return group.title === value;
    });

    var group = groups[index] || {
      title: value,
      items: []
    };

    group.items.push(item);
    if (index < 0) {
      groups.push(group);
    } else {
      groups.splice(index, 1, group);
    }
    return groups;
  }, []);
}

function getMatch (str, regexp, index) {
  return ((str || '').match(regexp) || [])[index];
}

module.exports = {
  isArray: isArray,
  isObject: isObject,
  assign: assign,
  normalizeUrl: normalizeUrl,
  sortBy: sortBy,
  groupBy: groupBy,
  getMatch: getMatch
}
