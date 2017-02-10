const BarracksCommand = require('./BarracksCommand');

function getAllDevices(token, barracks) {
  return barracks.getDevices(token);
}

function getAllDevicesFromSegment(token, barracks, segmentName) {
  return new Promise((resolve, reject) => {
    barracks.getSegmentByName(token, segmentName).then(segment => {
      return barracks.getDevices(token, segment.id);
    }).then(resultStream => {
      resolve(resultStream);
    }).catch(err => {
      reject(err);
    });
  });
}

class DevicesCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--segment [segmentName]', '(Optionnal) Render devices from that segment only');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.segment) {
        return getAllDevicesFromSegment(token, this.barracks, program.segment);
      } else {
        return getAllDevices(token, this.barracks);
      }
    });
  }
}

module.exports = DevicesCommand;
