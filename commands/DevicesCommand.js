const BarracksCommand = require('./BarracksCommand');

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

function configureCommandV1(program, experimental) {
  if (experimental) {
    return program
        .option('--segment [segmentName]', '(Optional) Render devices from that segment only (Cannot be used with --filter).')
        .option('--filter [filterName]', '(Optional) Apply a filter on the device list (Cannot be used with --segment).');
  } else {
    return program
        .option('--segment [segmentName]', '(Optional) Render devices from that segment only.');
  }
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
    if (this.v2Enabled) {
      return program;
    } else {
      return configureCommandV1(program, this.experimental);
    }
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.segment && !this.v2Enabled) {
        return getAllDevicesFromSegment(token, this.barracks, program.segment);
      } else if (program.filter && !this.v2Enabled) {
        return getAllDevicesFromFilter(token, this.barracks, program.filter);
      } else {
        return this.barracks.getDevices(token);
      }
    });
  }
}

module.exports = DevicesCommand;
