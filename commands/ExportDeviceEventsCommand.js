const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

class ExportDeviceEventsCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--unitId [unit id]', 'The unit id to retrieve the event history from.')
      .option('--fromDate [\'yyyy-mm-dd\']', '(Optionnal) The date from when to begin the export');
  }

  validateCommand(program) {
    const hasUnitId = !!(program.unitId && program.unitId != true);
    let validDateFrom = true;
    if (program.fromDate) {
      if (program.fromDate === true) {
        validDateFrom = false;
      } else {
        validDateFrom = !isNaN(Date.parse(program.fromDate));
      }
    }
    return hasUnitId && validDateFrom;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.fromDate) {
        const fromDate = Date.parse(program.fromDate);
        return new Promise((resolve, reject) => {
          const stream = new PageableStream();
          this.barracks.getDeviceEvents(token, program.unitId).then(result => {
            resolve(stream);
            result.onPageReceived(page => {
              page.forEach(event => {
                if (fromDate < Date.parse(event.receptionDate)) {
                  stream.write(event);
                }
              });
            });
            result.onLastPage(() => {
              stream.lastPage();
            });
          }).catch(err => {
            pageableStream.fail(err);
          });
        });
      } else {
        return this.barracks.getDeviceEvents(token, program.unitId);
      }
    });
  }
}

module.exports = ExportDeviceEventsCommand;
