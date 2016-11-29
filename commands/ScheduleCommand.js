const BarracksCommand = require('./BarracksCommand');

function isDate(date) {
  return new RegExp(/\d{4}-\d{2}-\d{2}/).test(date);
}

function isTime(time) {
  return new RegExp(/\d{2}:\d{2}/).test(time);
}

class ScheduleCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<update-uuid>')
      .option('--date [YYYY-MM-dd]')
      .option('--time [HH:mm]');
  }

  validateCommand(program) {
    return program.date && isDate(program.date)
      && program.time && isTime(program.time);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.scheduleCommand(token, program.args[0]);
    });
  }

}

module.exports = ScheduleCommand;