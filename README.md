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

    login          Authenticate to Barracks
    account        Get account information
    update [cmd]   Manage updates
    device [cmd]   Manage devices
    segment [cmd]  Manage segments
    check-update   Check for an update the same way a device would
    help [cmd]     display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

You need to login to Barracks before using any other command:
```{r, engine='bash', count_lines}
$ barracks login
email: myaccount@mail.com
password:
Authentication successful
```
### Barracks V2 support

Enable the V2 flag to access new features of Barracks.
To do so, just enable the V2 flag :
```{r, engine='bash', count_lines}
$ export BARRACKS_ENABLE_V2=1
```

Now, you have access to all V2 features
```{r, engine='bash', count_lines}
$ barracks help

  Usage: barracks [options] [command]


  Commands:

    login          Authenticate to Barracks
    account        Get account information
    device [cmd]   Manage devices
    filter [cmd]   Manage filters
    package [cmd]  Manage packages
    help [cmd]     display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```


## Features

Currently, the following features are available through the CLI:
* Login to your Barracks account
* Display account information
* Manage updates
    * List all updates
    * Create a new update
    * Edit an update draft
    * Publish an update
    * Archive an update
    * Schedule an update
* Manage devices
    * List all registered devices
    * List event history of a device
* Manage segments
    * List all segments
    * Create a new segment
    * Edit an existing segment
    * Change active segments
* Simulate a device checking for update

### With Barracks V2 enabled

* Login to your Barracks account
* Display account information   
* Manage devices
    * List all registered devices
    * Display detailed information of a device
    * List event history of a device
* Manage filters
    * List all filters
    * Create a new filter
    * Display filter information
    * Remove an existing filter
* Manage packages
    * List all existing packages
    * Create a new package
    * Display detailed information of a package
    * Publish a deployment plan for a package
    * Display detailed information of a deployment plan
    * List all versions of a packages
    * Create a new version of a package

## Docs & Community

* [Website and Documentation](https://barracks.io/)
* [Github Organization](https://github.com/barracksiot) for other official tools

## Examples

Create a new update
```{r, engine='bash', count_lines}
$ barracks update create --title "My Update" --segment Other --versionId v0.0.14 --package /home/barracks/packages/0.0.14/update.zip
```

Get event history of a device
```{r, engine='bash', count_lines}
$ barracks device get "unit_qwerty1234"
```

Emulate a device checking for an update
```{r, engine='bash', count_lines}
barracks check-update --unitId EmulatedDeviceId --versionId "0.1"
```

```{r, engine='bash', count_lines}
barracks check-update --unitId EmulatedDeviceId --versionId "0.1" --customClientData '{ "key1":"value1", "key2":"value2" }'
```

```{r, engine='bash', count_lines}
barracks check-update --unitId EmulatedDeviceId --versionId "0.1" --customClientData '{ "key1":"value1", "key2":"value2" }' --download ~/Downloads/update.sh
```

### With Barracks V2 enabled

Get event history of a device
```{r, engine='bash', count_lines}
$ barracks device get "unit_qwerty1234"
```

Create a filter
```{r, engine='bash', count_lines}
$ barracks filter create --name "exampleFilter" --query '{ "regex": { "unitId": ".*qwerty.*" } }'
```

Get all devices matching a filter
```{r, engine='bash', count_lines}
$ barracks device ls --filter "exampleFilter"
```

Create a package
```{r, engine='bash', count_lines}
$ barracks package create --reference io.barracks.app1 --name "Barracks Appli 1"
```

Create a version for a package
```{r, engine='bash', count_lines}
$ barracks package version create --versionId v1 --name "App 1 - Version 1" --packageReference io.barracks.app1 --file ~/versions/app1_v1_.sh
```

Publish a deployment plan for a package
```{r, engine='bash', count_lines}
$ barracks package plan publish --file ~/ressources/app1_plan.json
```

```{r, engine='bash', count_lines}
$ cat ~/ressources/app1_plan.json | barracks package plan publish
```


## License

  [Apache License, Version 2.0](LICENSE)