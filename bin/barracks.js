#!/usr/bin/env node

const program = require('commander');
const config = require('../config.js');
const pjson = require('../package.json');

const barracks = program
  .version(pjson.version)
  .command('login', 'Authenticate to Barracks')
  .command('account', 'Get account information')
  .command('updates', 'List updates')
  .command('create-update', 'Create a new update')
  .command('edit-update', 'Edit an existing update')
  .command('publish', 'Publish an update')
  .command('schedule', 'Publish an update')
  .command('archive', 'Archive an update')
  .command('devices', 'List devices')
  .command('device', 'Get device history')
  .command('segments', 'Get active and inactive segments')
  .command('create-segment', 'Create a new segment')
  .command('edit-segment', 'Edit an existing segment')
  .command('set-active-segments', 'Set active segments in priority order')
  .command('check-update', 'Check for an update the same way a device would');

if (config.experimental) {
  barracks
    .command('create-package', 'Create a new package')
    .command('packages', 'List packages')
    .command('create-package-version', 'Create a package version')
    .command('create-deployment-plan', 'Create a deployment plan for a package')
    .command('package-versions', 'List versions of the specified package')
    .command('create-filter', 'Create a filter')
    .command('filters', 'List filters')
    .command('delete-filter', 'Delete a filter')
    .command('create-token', 'Create an API token')
    .command('tokens', 'List all API tokens')
    .command('revoke-token', 'Revoke the specified API token')
    .command('set-ga-tracking-id', 'Set your Google Analytics tracking Id');
}

barracks.parse(process.argv);

process.on('SIGINT', () => {
  process.exit();
});
