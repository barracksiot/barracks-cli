const BarracksCommand = require('../BarracksCommand');

class DeviceHistoryCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<unit-id>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDevice(token, program.args[0]);
    });
  }
}

module.exports = DeviceHistoryCommand;
