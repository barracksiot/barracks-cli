const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

function getDeviceEvents(token, barracks, unitId, fromDate) {
  return new Promise((resolve, reject) => {
    const stream = new PageableStream();
    barracks.getDeviceEvents(token, unitId).then(result => {
      resolve(stream);
      result.onPageReceived(page => {
        filterByMinDate(page, fromDate).forEach(event => {
          stream.write(event);          
        });
      });
      result.onLastPage(() => {
        stream.lastPage();
      });
    }).catch(err => {
      stream.fail(err);
    });
  });
}

function filterByMinDate(events, date) {
  if (date) {
    return events.filter(event => {
      return Date.parse(date) < Date.parse(event.receptionDate);
    });
  }
  return events;
}

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
      return getDeviceEvents(token, this.barracks, program.unitId, program.fromDate);
    });
  }
}

module.exports = DeviceCommand;
