const BarracksCommand = require('./BarracksCommand');

function getQuery(token, program, barracks) {
  return new Promise((resolve, reject) => {
    let promise;
    if (program.segment) {
      promise = barracks.getSegmentByName(token, program.segment);
    } else if (program.filter) {
      promise = barracks.getFilterByName(token, program.filter);
    } else {
      promise = Promise.resolve({});
    }

    promise.then(filterObject => {
      resolve(filterObject.query);
    }).catch(err => {
      reject(err);
    });
  });
}

function checkExclusiveOptions(program) {
  const validSegment = !!(program.segment && program.segment !== true);
  const validFilter = !!(program.filter && program.filter !== true);
  return validFilter ? !validSegment : validSegment;
}

class DevicesCommand extends BarracksCommand {

  validateCommand(program) {
    if (program.segment || program.filter) {
      return checkExclusiveOptions(program);
    } else {
      return true;
    }
  }

  configureCommand(program) {
    return program
      .option('--segment [segmentName]', '(Optionnal) Render devices from that segment only (Cannot be used with --filter).')
      .option('--filter [filterName]', '(Optionnal) Apply a filter on the device list (Cannot be used with --segment).');
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return getQuery(token, program, this.barracks);
    }).then(query => {
      return this.barracks.getDevices(token, query);
    });
  }
}

module.exports = DevicesCommand;
