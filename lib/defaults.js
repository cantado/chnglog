'use stricts';

module.exports = {
  changelogrcPath: '.changelogrc',
  applicationName: 'My App',
  description: '',
  logo: '',
  branch: 'master',
  repository: '',
  debug: false,
  sections: [
    {
      title: 'Bug Fixes',
      grep: '^fix'
    },
    {
      title: 'Features',
      grep: '^feat'
    },
    {
      title: 'Documentation',
      grep: '^docs'
    },
    {
      title: 'Breaking changes',
      grep: 'BREAKING'
    },
    {
      title: 'Refactor',
      grep: '^refactor'
    },
    {
      title: 'Style',
      grep: '^style'
    },
    {
      title: 'Test',
      grep: '^test'
    },
    {
      title: 'Chore',
      grep: '^chore'
    },
    {
      title: 'Branchs merged',
      grep: '^Merge branch'
    },
    {
      title: 'Pull requests merged',
      grep: '^Merge pull request'
    }
  ]
};
