const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const ObjectReader = require('../../utils/ObjectReader');

const eventType = {
  ping: 'PING',
  enrollment: 'ENROLLMENT',
  deviceDataChange: 'DEVICE_DATA_CHANGE',
  devicePackageChange: 'DEVICE_PACKAGE_CHANGE'
};

const hookType = {
  web: 'web',
  googleAnalytics: 'google_analytics',
  bigQuery: 'bigquery'
};

const hookTypeValidator = { 
  web: (program) => program.url && program.url !== true,
  googleAnalytics: (program) => program.gaTrackingId && program.gaTrackingId !== true,
  bigQuery: (program) => program.googleClientSecret && program.googleClientSecret !== true && Validator.fileExists(program.googleClientSecret)
};

function getGoogleClientSecret(program) {
  return ObjectReader.readObjectFromFile(program.googleClientSecret);
}

function hasValidEventType(program) {
  return (program.event && program.event !== true && !!eventType[program.event]);
}

function hasValidHookTypeAndArguments(program) {
  return !!hookTypeValidator[program.hookType] && hookTypeValidator[program.hookType](program);
}

function buildHook(program, secret) {
  return {
    type: hookType[program.hookType],
    name: program.name,
    eventType: eventType[program.event],
    url: program.url,
    gaTrackingId: program.gaTrackingId,
    googleClientSecret: secret
  };
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
      return this.barracks.createHook(token, buildHook(program, secret));
    });
  }
}

module.exports = CreateHookCommand;
