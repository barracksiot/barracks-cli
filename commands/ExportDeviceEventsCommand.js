const BarracksCommand = require('./BarracksCommand');

class ExportDeviceEventsCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [unit id]', 'The unit id to retrieve the event history from.');
  }

  validateCommand(program) {
    return !!(program.unitId && program.unitId != true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDeviceEvents(token, program.unitId);
    });
  }

}

module.exports = ExportDeviceEventsCommand;
