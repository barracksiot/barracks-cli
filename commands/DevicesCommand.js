const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');
const logger = require('../utils/logger');

function getAllDevices(token, barracks) {
  return new Promise((resolve, reject) => {
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
    })
  });
}

function getAllDevicesFromChannel(token, barracks, channelName) {
  return new Promise((resolve, reject) => {
    barracks.getChannelByName(token, channelName).then(channel => {
      return barracks.getDevices(token, channel.name);
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
      .option('--channel [channelName]', '(Optionnal) Render devices from that channel only');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program.channel) {
        return getAllDevicesFromChannel(token, this.barracks, program.channel);
      } else {
        return getAllDevices(token, this.barracks);
      }
    });
  }
}

module.exports = DevicesCommand;
