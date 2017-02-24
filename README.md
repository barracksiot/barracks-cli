[![Build Status](https://travis-ci.org/barracksiot/barracks-cli.svg?branch=master)](https://travis-ci.org/barracksiot/barracks-cli) [![Coverage Status](https://coveralls.io/repos/github/barracksiot/barracks-cli/badge.svg?branch=master)](https://coveralls.io/github/barracksiot/barracks-cli?branch=master) [![npm version](https://badge.fury.io/js/barracks-cli.svg)](https://badge.fury.io/js/barracks-cli)

![Barracks logo](https://barracks.io/wp-content/uploads/2016/09/barracks_logo_green.png)

# Barracks CLI
The Command Line Interface tool to interact with the [Barracks](https://barracks.io/) API

## Requirements

Node.js >= 6.x

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
    edit-update           Edit an existing update
    publish               Publish an update
    schedule              Publish an update
    archive               Archive an update
    devices               List devices
    device                Get device history
    segments              Get active and inactive segments
    create-segment        Create a new segment
    edit-segment          Edit an existing segment
    set-active-segments   Set active segments in priority order
    check-update          Check for an update the same way a device would
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

Examples of the check-update command:
```{r, engine='bash', count_lines}
$ barracks check-update --unitId EmulatedDeviceId --versionId "0.1"
```
```{r, engine='bash', count_lines}
$ barracks check-update --unitId EmulatedDeviceId --versionId "0.1" --customClientData '{ "key1":"value1", "key2":"value2" }'
```
```{r, engine='bash', count_lines}
$ barracks check-update --unitId EmulatedDeviceId --versionId "0.1" --customClientData '{ "key1":"value1", "key2":"value2" }' --download ~/Downloads/update.sh
```

## Features

Currently, the following features are available through the CLI:
* Display account information
* List updates
* Create a new update
* Edit an update in draft
* Publish an update
* Archive an update
* Schedule an update
* List registered devices
* Retrieve device information
* List segments
* Change active segments
* Create a new segment
* Edit an existing segment
* Simulate a device check for update

## Docs & Community

* [Website and Documentation](https://barracks.io/)
* [Github Organization](https://github.com/barracksiot) for other official tools

## License

  [Apache License, Version 2.0](LICENSE)