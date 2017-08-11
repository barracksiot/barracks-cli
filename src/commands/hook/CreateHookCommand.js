const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const ObjectReader = require('../../utils/ObjectReader');

function getHookType(program) {
  if (program.hookType === 'web') {
    return 'web';
  } else if (program.hookType === 'googleAnalytics') {
    return 'google_analytics';
  } else if (program.hookType === 'bigQuery') {
    return 'bigquery';
  }
}

function getEventType(program) {
  if (program.event === 'ping') {
    return 'PING';
  }
  if (program.event === 'enrollment') {
    return 'ENROLLMENT';
  }
  if(program.event === 'deviceDataChange') {
    return 'DEVICE_DATA_CHANGE';
  }
  if(program.event === 'devicePackageChange') {
    return 'DEVICE_PACKAGE_CHANGE';
  }
}

function getGoogleClientSecret(program) {
  return ObjectReader.readObjectFromFile(program.googleClientSecret);
}

function hasValidEventType(program) {
  return (program.event && program.event !== true && 
    ['ping', 'enrollment', 'deviceDataChange', 'devicePackageChange'].indexOf(program.event) > -1);
}

function hasValidHookTypeAndArguments(program) {

  var handlers = { 
    web: (program) => program.url && program.url !== true,
    googleAnalytics: (program) => program.gaTrackingId && program.gaTrackingId !== true,
    bigQuery: (program) => program.googleClientSecret && program.googleClientSecret !== true && Validator.fileExists(program.googleClientSecret)
  } 

  return (['web', 'googleAnalytics', 'bigQuery'].indexOf(program.hookType) > -1) && handlers[program.hookType](program)
}

class CreateHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--event', 'To specify the type of event that triggers the hook (ping, enrollment, deviceDataChange or devicePackageChange).')
      .option('--hookType', 'To specify the type of hook we want to create (web, googleAnalytics or bigQuery)')
      .option('--name [value]', 'The unique name of the webhook')
      .option('--gaTrackingId [value]', 'The trackingId for the Google Analytics account')
      .option('--googleClientSecret [path/to/file]', 'The path to the file with the Google client secret json used to authenticate to BigQuery.')
      .option('--url [value]', 'The URL for this webhook');
  }

  validateCommand(program) {
    return !!(hasValidEventType(program) &&
      hasValidHookTypeAndArguments(program) &&
      program.name && program.name !== true
    );
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      if (program.googleClientSecret) {
        return getGoogleClientSecret(program);
      }
    }).then(secret => {
      return this.barracks.createHook(token, {
        type: getHookType(program),
        name: program.name,
        eventType: getEventType(program),
        url: program.url,
        gaTrackingId: program.gaTrackingId,
        googleClientSecret: secret
      });
    });
  }
}

module.exports = CreateHookCommand;
