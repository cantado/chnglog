'use strict';

var fs = require('fs');

function generateImage (image, alt, title) {
  if (!image) {
    return '';
  }
  return '![alt ' + (alt || title) + '](' + image + ' "' + title + '")';
}

function generateLink (link, text) {
  if (!link) {
    return '';
  }
  return '[' + (text || link) + '](' + link + ')';
}

function writeHeader (stream, data) {
  var image = generateImage(data.logo, data.applicationName, data.applicationName);
  var title = data.applicationName ? ('# ' + data.applicationName) : '';
  var description = data.description ? ('_' + data.description + '_') : '';

  stream.write(image + '\n\n');
  stream.write(title + '\n\n');
  stream.write(description + '\n\n');
}

function toDate (date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  month = month < 10 ? ('0' + month) : month;
  day = day < 10 ? ('0' + day) : day;
  return year + '-' + month + '-' + day;
}

function writeCommit (stream, commit, options) {
  options = options || {};
  var prefix = typeof options.prefix === 'string' ? options.prefix : '- ';
  var subject = typeof options.subject === 'string' ? options.subject : 'fullSubject';

  var links = [generateLink(commit.commitUrl, commit.commitShort)];
  links.concat(commit.closes.map(function (close) {
    return generateLink(close.link, close.issue);
  }));
  var str = prefix + commit.subject + ' (' + links.join(', ') + ')\n';
  if (commit.body) {
    str += ' '.repeat(prefix.length);
    str += commit.body + '\n';
  }
  stream.write(str);
}

function writeScopeGroup (stream, scopeGroup) {
  var prefix = '';
  var subject = 'subject';
  if (scopeGroup.title === 'undefined') {
    prefix = '- ';
    subject = 'fullSubject';
  } else {
    stream.write('- **' + scopeGroup.title + ':** ');
    if (scopeGroup.items.length > 1) {
      prefix = '  - ';
      stream.write('\n');
    }
  }
  for (var i=0; i<scopeGroup.items.length; i++) {
    writeCommit(stream, scopeGroup.items[i], {
      prefix: prefix,
      subject: subject
    });
  }
}

function writeScopeGroups (stream, scopeGroups) {
  for (var i=0; i<scopeGroups.length; i++) {
    writeScopeGroup(stream, scopeGroups[i]);
  }
}

function writeTypeGroup (stream, commits) {
  for (var type in commits) {
    stream.write('### ' + type + '\n\n');
    writeScopeGroups(stream, commits[type]);
    stream.write('\n\n');
  }
}

function writeItem (stream, item) {
  var headline = '## ' + item.tag;
  if (item.timestamp) {
    headline += ' (' + toDate(item.timestamp) + ')';
  }

  stream.write(headline + '\n\n');
  stream.write('---\n\n');
  writeTypeGroup(stream, item.commits);
}

function writeBody (stream, data) {
  for (var i=0; i<data.items.length; i++) {
    writeItem(stream, data.items[i]);
  }
}

function writeChangelog (data) {
  var stream = fs.createWriteStream(data.destination, {flag: 'w'});

  writeHeader(stream, data);
  writeBody(stream, data);
}

module.exports = writeChangelog;
