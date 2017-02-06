const BarracksCommand = require('./BarracksCommand');

class CheckUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<emulated-device>');
  }

  validateCommand(program) {
    return !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getAccount(token);
    }).then(account => {
      return this.barracks.checkUpdate(account.apiKey, JSON.parse(program.args[0]));
    });
  }

}

module.exports = CheckUpdateCommand;