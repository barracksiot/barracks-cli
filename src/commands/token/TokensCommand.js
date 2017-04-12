const BarracksCommand = require('../BarracksCommand');

class TokensCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getTokens(token);
    });
  }
}

module.exports = TokensCommand;
