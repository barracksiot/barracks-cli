[![Build Status](https://travis-ci.org/barracksiot/barracks-cli.svg?branch=master)](https://travis-ci.org/barracksiot/barracks-cli)

![Barracks logo](https://barracks.io/wp-content/uploads/2016/09/barracks_logo_green.png)

# Barracks CLI
The Command Line Interface tool to interact with the [Barracks](https://barracks.io/) API

## Requirements

Node.js >= 5.x

## Installation

```{r, engine='bash', count_lines}
$ npm install -g barracks-cli
```

## Usage

At any moment, if you want to know what you can do with the CLI or if you need any help about a specific command, you can use the *help* command:
```{r, engine='bash', count_lines}
$ barracks help

  Usage: barracks [options] [command]


  Commands:

    login                 Authenticate to Barracks
    account               Get account information
    updates               List updates
    create-update         Create a new update
    publish               Publish an update
    schedule              Publish an update
    archive               Archive an update
    devices               List devices
    device                Get device history
    segments              Get active and inactive segments
    set-active-segments   Set active segments in priority order
    help [cmd]            display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

You need to login to Barracks before using any other command:
```{r, engine='bash', count_lines}
$ barracks login
email: myaccount@barracks.io
password:
Authentication successful
```

```{r, engine='bash', count_lines}
$ barracks login --email myaccount@barracks.io --password <ACCOUNT_PASSWORD>
Authentication successful
```

After that, you can use any of the other commands:
```{r, engine='bash', count_lines}
$ barracks create-update --title "My Update" --segment Other --versionId v0.0.14 --package /home/bargenson/packages/0.0.14/update.zip
```

## Features

Currently, the following features are available through the CLI:
* Display account information
* List updates
* Create a new update
* Publish an update
* Archive an update
* Schedule an update
* List registered devices
* Retrieve device information
* List segments
* Change active segments

## Docs & Community

* [Website and Documentation](https://barracks.io/)
* [Github Organization](https://github.com/barracksiot) for other official tools

## License

  [Apache License, Version 2.0](LICENSE)