const BarracksCommand = require('../BarracksCommand');

function getHookType(program) {
  if (program.web) {
    return 'web';
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

class CreateHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--ping', 'To create a hook triggered by the ping of a device.')
      .option('--enrollment', 'To create a hook for the first ping of a device')
      .option('--web', 'To create a web hook')
      .option('--name [value]', 'The unique name of the webhook')
      .option('--url [value]', 'The URL for this webhook');
  }

  validateCommand(program) {
    return !!(
      (!program.ping && program.enrollment ||
        program.ping && !program.enrollment) &&
      program.web &&
      program.url && program.url !== true && 
      program.name && program.name !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createHook(token,  {
        type: getHookType(program),
        name: program.name,
        eventType: getEventType(program),
        url: program.url
      });
    });
  }
}

module.exports = CreateHookCommand;
