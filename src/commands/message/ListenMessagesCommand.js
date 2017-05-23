const BarracksCommand = require('../BarracksCommand');

class ListenMessagesCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [value]', 'The unit Id')
      .option('--timeout [value]', '(Optional) Number of seconds before ending the command');
  }

  validateCommand(program) {
    return !!(
      program.unitId && program.unitId !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    }).then(account => {
      return this.barracks.listenMessages(account.apiKey, program.unitId, program.timeout);
    });
  }
}

module.exports = ListenMessagesCommand;
