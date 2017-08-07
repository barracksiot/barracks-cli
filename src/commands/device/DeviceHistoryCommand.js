const AuthenticatedBarracksCommand = require('../AuthenticatedBarracksCommand');

class DeviceHistoryCommand extends AuthenticatedBarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<unit-id>')
      .option('--fromDate [\'YYYY-MM-DD\' | \'YYYY-MM-DD HH:mm\' | \'YYYY-MM-DDTHH:mm:ss.sssZ\']', '(Optionnal) The date from when to begin the history');
  }

  validateCommand(program) {
    const hasUnitId = !!(program.args && program.args.length === 1 && program.args[0] !== true);
    const hasValidFromDate = !program.fromDate || !isNaN(Date.parse(program.fromDate));
    return hasUnitId && hasValidFromDate;
  }

  execute(program, token) {
    return this.barracks.getDeviceEvents(token, program.args[0], program.fromDate);
  }
}

module.exports = DeviceHistoryCommand;
