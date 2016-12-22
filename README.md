# Chnglog (Changelog)

A module to generate a version Changelog file out of the VCS logs.
Currently only for Git.

## Command Line

See commands
```
node index.js -h

or

./index.js -h
```

Use it with common options
```
  Usage: index [options] <version>

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -c, --config [file]    the configuration file (default: .changelogrc)
    -a, --app-name [name]  the application name (default: "My App")
    -l, --logo [logo]      the url to the logo (default: "")
    -b, --branch [branch]  the name of the branch (default: "master")
    -r, --repo-url [repo]  the url of the repo (default: "")
    -i, --intro [intro]    small description of the application (default: "")
    --debug                activate debug mode (default: false)
```

Example
```
./index.js --debug v1.0
```
