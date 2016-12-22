'use strict';

var fs = require('fs');
var path = require('path');

var defaultOptions = require('./defaults');
var util = require('./util');
var git = require('./vcs/git');
var writeChangelog = require('./writeChangelog');
var Commit = require('./commit');

function Changelogger (options) {
  var self = this;
  self.changelogrcPath = options.changelogrcPath || defaultOptions.changelogrcPath;
  self.version = options.version;
  self.destination = path.resolve(process.cwd(), 'CHANGELOG.md');
  self.vcs = git;

  self.readConfigFile(function (err, data) {
    self.setAttributes(data, options);
    self.log('Call Changelogger with Attributes:');
    self.log('  changelogrcPath: ' + self.changelogrcPath);
    self.log('  applicationName: ' + self.applicationName);
    self.log('  description:     ' + self.description);
    self.log('  logo:            ' + self.logo);
    self.log('  branch:          ' + self.branch);
    self.log('  repository:      ' + self.repository);
    self.log('  debug:           ' + self.debug);
    self.log('  sections:        ' + JSON.stringify(self.sections));

    self.init();
  });
}

Changelogger.prototype.setAttributes = function setAttributes () {
  var args = Array.prototype.slice.call(arguments);
  args = [{}, defaultOptions].concat(args);
  var options = util.assign.apply(null, args);
  for (var key in options) {
    this[key] = options[key];
  }
  this.repository = util.normalizeUrl(this.repository);
};

Changelogger.prototype.init = function init () {
  var self = this;

  this.getTagItems()
    .then(this.fetchTagsCommits.bind(this))
    .then(function (items) {
      self.items = items;
      writeChangelog(self);
      self.log('Generating ' + self.destination + ' done.');
    })
    .catch(function (err) {
      console.error(err);
    });
};

Changelogger.prototype.log = function log () {
  if (this.debug) {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('>> Changelogger: ');
    console.log.apply(console, args);
  }
};

Changelogger.prototype.readConfigFile = function readConfigFile (done) {
  var self = this;
  var filepath = path.resolve(process.cwd(), self.changelogrcPath);
  self.log('Try to find and parse config file: ' + filepath);
  fs.readFile(filepath, 'utf8', function (err, data) {
    if (err) {
      self.log(err.message);
      if (err.code === 'ENOENT') {
        err = null;
      }
      return done(err, {});
    }
    try {
      self.log('Config file found: ' + filepath);
      return done(null, JSON.parse(data));
    } catch (e) {
      self.log('Error: Config file is not valid');
      self.log('' + e);
      return done(e, {});
    }
  });
};

Changelogger.prototype.getGitTags = function getGitTags () {
  var self = this;
  self.log('Getting Git tags');

  return self.vcs.getTags()
    .then(function (tags) {
      if (tags.indexOf(self.version) < 0) {
        tags.unshift(self.version);
      }
      self.log(tags);
      return tags
    });
};

Changelogger.prototype.getGitTagTimestamp = function getGitTagTimestamp (tag) {
  var self = this;
  self.log('Getting Git tag timestamp for tag "' + tag + '"');

  var cmdArgs = {
    version: tag === self.version ? '' : tag
  };

  return self.vcs.getTagTimestamp(cmdArgs)
    .then(function (timestamp) {
      self.log('"' + tag + '" - ' + timestamp);
      return {
        tag: tag,
        timestamp: new Date(timestamp[0])
      };
    });
};

Changelogger.prototype.getGitTagTimestamps = function getGitTagTimestamps (tags) {
  var promises = tags.map(this.getGitTagTimestamp.bind(this));
  return Promise.all(promises);
};

Changelogger.prototype.getGitTagAndTimestamp = function getGitTagAndTimestamp () {
  return this.getGitTags()
    .then(this.getGitTagTimestamps.bind(this));
};

Changelogger.prototype.getTagItems = function getTagItems () {
  return this.getGitTagAndTimestamp()
    .then(function (items) {
      items = util.sortBy(items, 'timestamp', -1);
      for (var i=0; i<items.length; i++) {
        items[i].to = i === 0 ? 'HEAD' : items[i].tag;
        items[i].from = items[i+1] ? items[i+1].tag : null;
      }
      return items;
    });
};

Changelogger.prototype.groupCommits = function groupCommits (items) {
  var sections = this.sections;
  return items.reduce(function (obj, item) {
    for (var i=0; i<sections.length; i++) {
      var grep = new RegExp(sections[i].grep);
      if (grep.test(item.fullSubject)) {
        var title = sections[i].title;
        if (title.match(/conflict/i)) {
          console.log(title);
        }
        obj[title] = obj[title] || [];
        obj[title].push(item);
        break;
      }
    }
    return obj;
  }, {});
};

Changelogger.prototype.removeRevertedCommit = function removeRevertedCommit (commits, index, remove) {
  var item = commits[index];
  if (!item) {
    return 0;
  }

  var revertCommit = util.getMatch(item.body, /This reverts commit ([a-z0-9]+)/i, 1);

  if (revertCommit) {
    commits.splice(index, 1);
    index = commits.findIndex(function (item) {
      return revertCommit === item.commit;
    });
    return 1 + this.removeRevertedCommit(commits, index, !remove);
  }

  if (remove) {
    commits.splice(index, 1);
    return 1;
  }

  return 0;
};

Changelogger.prototype.removeRevertedCommits = function removeRevertedCommits (commits) {
  for (var i=0; i<commits.length; i++) {
    var revertCommit = util.getMatch(commits[i].body, /This reverts commit ([a-z0-9]+)/i, 1);
    if (revertCommit) {
      var numOfRemovedItems = this.removeRevertedCommit(commits, i);
      i--;
    }
  }
};

Changelogger.prototype.fetchTagCommits = function fetchTagCommits (item) {
  var self = this;
  self.log('Getting Git tag commits for tag "' + item.tag + '"');

  return git.getTagCommit(item, {delimiter: /\n+/})
    .then(function (commits) {
      self.log(commits.length + ' commits found for tag "' + item.tag + '"');
      return commits;
    })
    .then(function (commits) {
      return commits.map(function (com) {
        return Commit.createCommit(com, '###', {
          repository: self.repository
        });
      });
    })
    .then(function (commits) {
      self.removeRevertedCommits(commits);
      return commits;
    })
    .then(function (commits) {
      commits = self.groupCommits(commits);
      for (var type in commits) {
        commits[type] = util.groupBy(commits[type], 'scope');
        //TODO: sort by alphabet with noScope first
      }
      item.commits = commits;
      return item;
    });
};

Changelogger.prototype.fetchTagsCommits = function fetchTagsCommits (items) {
  var promises = items.map(this.fetchTagCommits.bind(this));
  return Promise.all(promises);
};

Changelogger.defaults = defaultOptions;
module.exports = Changelogger;
