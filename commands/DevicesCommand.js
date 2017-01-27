const PageableStream = require('../clients/PageableStream');
const BarracksCommand = require('./BarracksCommand');

function getAllDevices(token, barracks) {
  return new Promise((resolve, reject) => {
    const stream = new PageableStream();
    resolve(stream);
    barracks.getChannels(token).then(channels => {
      const channelCount = channels.length;
      let streamClosedCount = 0;
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
          stream.fail(err);
        });
      });
    }).catch(err => {
      stream.fail(err);
    });
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
