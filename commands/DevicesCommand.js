const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

function getAllDevices(token, barracks) {
  return new Promise(resolve => {
    const stream = new PageableStream();
    resolve(stream);
    getActiveSegmentsIdsWithOther(token, barracks).then(activeSegmentsIds => {
      const activeSegmentCount = activeSegmentsIds.length;
      let streamClosedCount = 0;
      activeSegmentsIds.forEach(segmentId => {
        barracks.getDevices(token, segmentId).then(resultStream => {
          resultStream.onPageReceived(page => {
            stream.write(page);
          });
          resultStream.onLastPage(() => {
            ++streamClosedCount;
            if (streamClosedCount === activeSegmentCount) {
              stream.lastPage();                  
            }
          });
        }).catch(err => {
          stream.fail(err);
        });
      });
    }).catch(err => {
      stream.fail(err);
    });
  });
}

function getActiveSegmentsIdsWithOther(token, barracks) {
  return new Promise((resolve, reject) => {
    barracks.getSegments(token).then(result => {
      resolve(result.active.map(segment => segment.id).concat('other'));
    }).catch(err => {
      reject(err);
    });
  });
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
