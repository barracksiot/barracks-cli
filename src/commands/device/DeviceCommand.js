const AuthenticatedBarracksCommand = require('../AuthenticatedBarracksCommand');

class DeviceCommand extends AuthenticatedBarracksCommand {

  configureCommand(program) {
    return program.arguments('<unit-id>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1);
  }

  execute(program, token) {
    return this.barracks.getDevice(token, program.args[0]);
  }
}

module.exports = DeviceCommand;
