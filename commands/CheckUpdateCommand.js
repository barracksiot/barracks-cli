const BarracksCommand = require('./BarracksCommand');

class CheckUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<emulated-device>')
      .arguments('<api-key>');
  }

  validateCommand(program) {
    return !!program.args[0] && !!program.args[1];
  }

  execute(program) {
    //return this.getAuthenticationToken().then(token => {
      return this.barracks.checkUpdate(program.args[1], JSON.parse(program.args[0]));
    //});
  }

}

module.exports = CheckUpdateCommand;