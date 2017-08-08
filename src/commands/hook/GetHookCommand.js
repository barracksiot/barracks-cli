const BarracksCommand = require('../BarracksCommand');

class GetHookCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<hook-name>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getHook(token, program.args[0]);
    });
  }
}

module.exports = GetHookCommand;
