#!/usr/bin/env node

const program = require('commander');
const pjson = require('./package.json');
 
program
  .version(pjson.version)
  .command('login', 'Authenticate to Barracks')
  .command('account', 'Get account information')
  .command('updates', 'List updates')
  .command('publish', 'Publish an update')
  .command('archive', 'Archive an update')
  .parse(process.argv);