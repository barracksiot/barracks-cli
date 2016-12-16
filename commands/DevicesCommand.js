const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

function getAllDevices(token, barracks) {
  return new Promise((resolve, reject) => {
    barracks.getChannels(token).then(channels => {
      const stream = new PageableStream();
      const channelCount = channels.length;
      let streamClosedCount = 0;
      resolve(stream);
      channels.forEach(channel => {
        barracks.getDevices(token, channel.name).then(resultStream => {
          resultStream.onPageReceived(page => {
            stream.write(page);
          });
          resultStream.onLastPage(() => {
            ++streamClosedCount;
            if (streamClosedCount === channelCount) {
              stream.lastPage();                  
            }
          });
        }).catch(err => {
          pageableStream.fail(err);
        });
      });
    });
  });
}

class DevicesCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return getAllDevices(token, this.barracks);
    });
  }
}

module.exports = DevicesCommand;