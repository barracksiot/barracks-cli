const BarracksCommand = require('./BarracksCommand');

class RevokeTokenCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--token-id [value]', 'The id of the token');
  }

  validateCommand(program) {
    return !!(program['token-id'] && program['token-id'] !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.revokeToken(token, program['token-id']);
    });
  }
}

module.exports = RevokeTokenCommand;
