const BarracksCommand = require('./BarracksCommand');

class RevokeTokenCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<token>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1 && program.args[0] !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.revokeToken(token, program.args[0]);
    });
  }
}

module.exports = RevokeTokenCommand;
