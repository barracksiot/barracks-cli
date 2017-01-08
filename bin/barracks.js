#!/usr/bin/env node

const program = require('commander');
const pjson = require('../package.json');
 
program
  .version(pjson.version)
  .command('login', 'Authenticate to Barracks')
  .command('account', 'Get account information')
  .command('updates', 'List updates')
  .command('create-update', 'Create a new update')
  .command('publish', 'Publish an update')
  .command('schedule', 'Publish an update')
  .command('archive', 'Archive an update')
  .command('devices', 'List devices')
  .command('device', 'Get device history')
  .parse(process.argv);

process.on('SIGINT', () => {
  process.exit();
});