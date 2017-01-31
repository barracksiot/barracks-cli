const BarracksCommand = require('./BarracksCommand');

class DeviceCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<unit-id>')
      .option('--fromDate [\'YYYY-MM-DD\' | \'YYYY-MM-DDTHH:mm:ss.sssZ\']', '(Optionnal) The date (ISO-8601) from when to begin the history.');
  }

  validateCommand(program) {
    const hasUnitId = !!(program.args && program.args.length === 1 && program.args[0] !== true);
    const hasValidFromDate = !program.fromDate || !isNaN(Date.parse(program.fromDate));
    return hasUnitId && hasValidFromDate;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDeviceEvents(token, program.args[0], program.fromDate);
    });
  }
}

module.exports = DeviceCommand;
