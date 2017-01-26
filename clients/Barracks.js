const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const fs = require('fs');
const path = require('path');

class Barracks {

  constructor(options) {
    this.client = new HTTPClient(options);
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('login', {
        body: { username, password }
      }).then(response => {
        resolve(response.headers['x-auth-token']);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getAccount(token) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('me', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getUpdates(token) {
    return new Promise((resolve, reject) => {
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'updates', {
        headers: {
          'x-auth-token': token
        }
      },
      'memberUpdateInfoes');
    });
  }

  publishUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('publishUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  archiveUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('archiveUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  scheduleUpdate(token, uuid, date) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('archiveUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  createPackage(token, updatePackage) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createPackage', {
        headers: {
          'x-auth-token': token
        },
        formData: {
          versionId: updatePackage.versionId,
          file: {
            value: fs.createReadStream(updatePackage.file),
            options: {
              filename: path.basename(updatePackage.file)
            }
          }
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getChannelByName(token, channelName) {
    return new Promise((resolve, reject) => {
      this.getChannels(token).then(channels => {
        const channel = channels.find(channel => {
          return channel.name === channelName;
        });
        if (channel) {
          resolve(channel);
        } else {
          reject('No matching channel name');
        }
      }).catch(err => {
        reject(err);
      });
    });
  }

  getChannels(token) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('getChannels', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        resolve(response.body._embedded);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  createUpdate(token, update) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createUpdate', {
        headers: {
          'x-auth-token': token
        },
        body: update
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getDevices(token, channelName) {
    return new Promise((resolve, reject) => {
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getDevices', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          channelName
        }
      },
      'deviceEvents');
    });
  }

  getDeviceEvents(token, unitId, fromDate) {
    return new Promise((resolve, reject) => {
      const resultStream = new PageableStream();
      const bufferStream = new PageableStream();
      resolve(resultStream);
      this.client.retrievePagesUntilCondition(bufferStream, 'getDeviceEvents', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          unitId
        }
      }, 'deviceEvents', events => 
        fromDate && events.some(event => Date.parse(event.receptionDate) < Date.parse(fromDate))
      );
      bufferStream.onPageReceived(events => {
        const filteredEvents = events.filter(event =>
          Date.parse(fromDate || 0) < Date.parse(event.receptionDate)
        );
        if (filteredEvents.length > 0) {
          resultStream.write(filteredEvents);
        }
      });
      bufferStream.onLastPage(() => {
        resultStream.lastPage();
      });
    });
  }
};

module.exports = Barracks;