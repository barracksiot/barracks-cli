const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const ObjectReader = require('../../utils/ObjectReader');

function getHookType(program) {
  if (program.web) {
    return 'web';
  } else if (program.googleAnalytics) {
    return 'google_analytics';
  } else if (program.bigquery) {
    return 'bigquery';
  }
}

function getEventType(program) {
  if (program.ping) {
    return 'PING';
  }
  if (program.enrollment) {
    return 'ENROLLMENT';
  }
}

function getObject(program) {
  if (program.googleClientSecret) {
    return ObjectReader.readObjectFromFile(program.googleClientSecret);
  } else {
    return ObjectReader.readObjectFromStdin();
  }
}

class CreateHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--ping', 'To create a hook triggered by the ping of a device.')
      .option('--enrollment', 'To create a hook for the first ping of a device')
      .option('--web', 'To create a web hook')
      .option('--googleAnalytics', 'To create a Google Analytics hook')
      .option('--bigquery', 'To create a BigQuery hook')
      .option('--name [value]', 'The unique name of the webhook')
      .option('--gaTrackingId [value]', 'The trackingId for the Google Analytics account')
      .option('--googleClientSecret [path/to/file]', 'The path to the file with the Google client secret json used to authenticate to BigQuery.')
      .option('--url [value]', 'The URL for this webhook');
  }

  validateCommand(program) {
    return !!(
      (!program.ping && program.enrollment ||
        program.ping && !program.enrollment) &&
      (program.web && !program.googleAnalytics && !program.bigquery && program.url && program.url !== true ||
        !program.web && program.googleAnalytics && !program.bigquery && program.gaTrackingId && program.gaTrackingId !== true ||
        !program.web && !program.googleAnalytics && program.bigquery && program.googleClientSecret && Validator.fileExists(program.googleClientSecret)) &&
      program.name && program.name !== true
    );
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return getObject(program);
    }).then(secret => {
      return this.barracks.createHook(token, {
        type: getHookType(program),
        name: program.name,
        eventType: getEventType(program),
        url: program.url,
        gaTrackingId: program.gaTrackingId || null,
        googleClientSecret: secret || null
      });
    });
  }
}

module.exports = CreateHookCommand;
