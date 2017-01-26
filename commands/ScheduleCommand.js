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

  parseScheduleDate(program) {
    return new Date(`${program.date} ${program.time}`);
  }

  validateCommand(program) {
    return !!(program.date && isDate(program.date)
      && program.time && isTime(program.time)
      && program.args[0]);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.scheduleUpdate(token, program.args[0], this.parseScheduleDate(program));
    });
  }

}

module.exports = ScheduleCommand;