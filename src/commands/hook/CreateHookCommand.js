const BarracksCommand = require('../BarracksCommand');

function getType(program) {
  if (program.web) {
    return 'web';
  }
}

class CreateHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--web', 'To create a web hook')
      .option('--name [value]', 'The unique name of the webhook')
      .option('--url [value]', 'The URL for this webhook');
  }

  validateCommand(program) {
    return !!(
      program.web &&
      program.url && program.url !== true && 
      program.name && program.name !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createHook(token,  {
        type: getType(program),
        name: program.name,
        url: program.url
      });
    });
  }
}

module.exports = CreateHookCommand;
