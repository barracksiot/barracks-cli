const BarracksCommand = require('../BarracksCommand');

class DeleteHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<hook-name>');
  }

  validateCommand(program) {
    return !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.deleteHook(token, program.args[0]);
    });
  }
}

module.exports = DeleteHookCommand;
