const BarracksCommand = require('./BarracksCommand');

class LogoutCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.revokeToken(token, token);
    }).then(() => {
      return this.saveAuthenticationToken('');
    }).then(() => {
      return 'Logout successful';
    });
  }
}

module.exports = LogoutCommand;