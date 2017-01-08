const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

class DeviceCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [unit id]', 'The unit id to retrieve the event history from.')
      .option('--fromDate [\'YYYY-MM-DD\' | \'YYYY-MM-DDTHH:mm:ss.sssZ\']', '(Optionnal) The date (ISO-8601) from when to begin the history.');
  }

  validateCommand(program) {
    const hasUnitId = !!(program.unitId && program.unitId !== true);
    const hasValidFromDate = !program.fromDate || !isNaN(Date.parse(program.fromDate));
    return hasUnitId && hasValidFromDate;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDeviceEvents(token, program.unitId, program.fromDate);
    });
  }
}

module.exports = DeviceCommand;
