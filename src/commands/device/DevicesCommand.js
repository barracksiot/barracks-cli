const BarracksCommand = require('../BarracksCommand');

function getAllDevicesFromFilter(token, barracks, filterName) {
  return new Promise((resolve, reject) => {
    barracks.getFilterByName(token, filterName).then(filter => {
      return barracks.getDevicesFilteredByQuery(token, filter.query);
    }).then(resultStream => {
      resolve(resultStream);
    }).catch(err => {
      reject(err);
    });
  });
}

function getAllDevicesFromSegment(token, barracks, segmentName) {
  return new Promise((resolve, reject) => {
    barracks.getSegmentByName(token, segmentName).then(segment => {
      return barracks.getSegmentDevices(token, segment.id);
    }).then(resultStream => {
      resolve(resultStream);
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
    if (this.experimental) {
      return program
        .option('--segment [segmentName]', '(Optionnal) Render devices from that segment only (Cannot be used with --filter).')
        .option('--filter [filterName]', '(Optionnal) Apply a filter on the device list (Cannot be used with --segment).');
    } else {
      return program
        .option('--segment [segmentName]', '(Optionnal) Render devices from that segment only.');
      }
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.segment) {
        return getAllDevicesFromSegment(token, this.barracks, program.segment);
      } else if (program.filter) {
        return getAllDevicesFromFilter(token, this.barracks, program.filter);
      } else {
        return this.barracks.getDevices(token);
      }
    });
  }
}

module.exports = DevicesCommand;
