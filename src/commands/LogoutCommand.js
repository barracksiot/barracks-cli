const BarracksCommand = require('./BarracksCommand');

class LogoutCommand extends BarracksCommand {

  execute() {
    return this.saveAuthenticationToken('').then(() => {
      return 'Logout successful';
    });
  }
}

module.exports = LogoutCommand;