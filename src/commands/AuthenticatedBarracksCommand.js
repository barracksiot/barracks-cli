const BarracksCommand = require('./BarracksCommand');

class AuthenticatedBarracksCommand extends BarracksCommand {

  getResult(program) {
    return this.getAuthenticationToken().then(token => {
      return this.execute(program, token);
    });
  }
}

module.exports = AuthenticatedBarracksCommand;
