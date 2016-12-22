'use strict';

var base = require('../base');

var commands = {
  tags: 'git tag',
  tagTimestamp: 'git log -1 --format=%ai {{version}}',
  tagCommits: 'git log --pretty=format:"%H###%an###%ae###%s###%b" {{from}}..{{to}}'
};

module.exports = base(commands);
