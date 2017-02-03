const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class Barracks {

  constructor(options) {
    this.client = new HTTPClient(options);
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      logger.debug('Authenticating:', username);
      this.client.sendEndpointRequest('login', {
        body: { username, password }
      }).then(response => {
        logger.debug('Authentication successful.');
        resolve(response.headers['x-auth-token']);
      }).catch(errResponse => {
        logger.debug('Authentication failure.');
        reject(errResponse.message);
      });
    });
  }

  getAccount(token) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting account information for token:', token);
      this.client.sendEndpointRequest('me', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        const account = response.body;
        logger.debug('Account information retrieved:', account);
        resolve(account);
      }).catch(errResponse => {
        logger.debug('Account information request failure.');
        reject(errResponse.message);
      });
    });
  }

  getUpdates(token) {
    return new Promise(resolve => {
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'updates', {
        headers: {
          'x-auth-token': token
        }
      },
      'detailedUpdates');
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
      this.client.sendEndpointRequest('scheduleUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid,
          time: date.toISOString()
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

  getSegmentByName(token, segmentName) {
    return new Promise((resolve, reject) => {
      this.getSegments(token).then(segments => {
        const segment = segments.active.concat(segments.other).find(segment => {
          return segment.name === segmentName;
        });
        if (segment) {
          resolve(segment);
        } else {
          reject('No matching active segment.');
        }
      }).catch(err => {
        reject(err);
      });
    });
  }

  getSegments(token) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting user segments...');
      this.client.sendEndpointRequest('getSegments', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        const segments = response.body;
        logger.debug('User segments retrieved:', segments);
        resolve(segments);
      }).catch(errResponse => {
        logger.debug('Get user segments failed with:', errResponse);
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

  getDevices(token, segmentId) {
    return new Promise(resolve => {
      logger.debug('Getting devices for segment:', segmentId);
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getDevices', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          segmentId
        }
      },
      'deviceEvents');
    });
  }

  getDeviceEvents(token, unitId, fromDate) {
    return new Promise(resolve => {
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

  setActiveSegments(token, segmentIds) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('setActiveSegments', {
        headers: {
          'x-auth-token': token
        },
        body: segmentIds
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }
}

module.exports = Barracks;
