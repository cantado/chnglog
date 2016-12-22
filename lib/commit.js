'use strict';

function createCommit (str, delimiter, options) {
  options = options || {};
  var arr = (str || '').split(delimiter || '###');

  options.commit = arr[0];
  options.author = arr[1];
  options.authorEmail = arr[2];
  options.subject = arr[3] || '';
  options.fullSubject = arr[3] || '';
  options.body = arr[4];

  if (typeof options.body === 'string') {
    options.body = options.body.replace(/\s*# .+/g, '');
  }

  return new Commit(options);
}

function Commit (options) {
  for (var key in options) {
    this[key] = options[key];
  }
  this.addAdditionalAttributes();
}

Commit.prototype.addAdditionalAttributes = function addAdditionalAttributes () {
  var self = this;

  self.commitShort = self.commit.substr(0, 8);
  self.commitUrl = self.repository + '/commit/' + self.commit;

  var commitMatch = self.subject.match(/^(\w+)(\(([^\)]+)\))?\s*:?\s*(.*)/);
  if (commitMatch) {
    self.type = commitMatch[1];
    self.scope = commitMatch[3];
    self.subject = commitMatch[4] || '';
  }

  self.closes = self.subject.match(/(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #\d+/gi) || [];
  self.closes = self.closes.map(function (close) {
    var issueNum = close.split('#')[1];
    return {
      issue: '#' + issueNum,
      link: self.repository + '/issues/' + issueNum
    };
  });
};

Commit.createCommit = createCommit;
module.exports = Commit;
