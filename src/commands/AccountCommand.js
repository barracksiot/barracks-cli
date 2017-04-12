const BarracksCommand = require('./BarracksCommand');

class AccountCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    });
  }

}

module.exports = AccountCommand;
