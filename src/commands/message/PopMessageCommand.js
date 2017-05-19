const BarracksCommand = require('../BarracksCommand');

class PopMessageCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--unitId [value]', 'The unit Id');
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
      return this.barracks.popMessage(account.apiKey, program.unitId);
    });
  }
}

module.exports = PopMessageCommand;
