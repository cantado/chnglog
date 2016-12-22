#!/usr/bin/env node

'use strict';

var program = require('commander');
var Changelogger = require('./lib/changelogger');
var newVersion = null;

program
  .version(require('./package').version)
  .usage('[options] <version>')
  .option('-c, --config [file]', 'the configuration file (default: ' + Changelogger.defaults.changelogrcPath + ')')
  .option('-a, --app-name [name]', 'the application name (default: "' + Changelogger.defaults.applicationName + '")')
  .option('-l, --logo [logo]', 'the url to the logo (default: "' + Changelogger.defaults.logo + '")')
  .option('-b, --branch [branch]', 'the name of the branch (default: "' + Changelogger.defaults.branch + '")')
  .option('-r, --repo-url [repo]', 'the url of the repo (default: "' + Changelogger.defaults.repository + '")')
  .option('-i, --intro [intro]', 'small description of the application (default: "' + Changelogger.defaults.description + '")')
  .option('--debug', 'activate debug mode (default: ' + Changelogger.defaults.debug + ')')
  .action(function (version) {
    newVersion = version;
  })
  .parse(process.argv);

if (!newVersion) {
  console.log('');
  console.log('  Error: No version given!');
  program.outputHelp();
  return;
}

var changelog = new Changelogger({
  version: newVersion,
  changelogrcPath: program.config,
  applicationName: program.appName,
  description: program.intro,
  logo: program.logo,
  branch: program.branch,
  repository: program.repoUrl,
  debug: program.debug
});

// changelog.generate();
