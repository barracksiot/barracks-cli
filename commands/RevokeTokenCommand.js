const BarracksCommand = require('./BarracksCommand');

class RevokeTokenCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--tokenId [value]', 'The id of the token');
  }

  validateCommand(program) {
    return !!(program.tokenId && program.tokenId !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.revokeToken(token, program.tokenId);
    });
  }
}

module.exports = RevokeTokenCommand;
