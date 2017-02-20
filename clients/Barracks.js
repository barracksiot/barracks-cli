const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const BarracksSDK = require('barracks-sdk');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class Barracks {

  constructor(options) {
    this.options = options;
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
      this.client.retrieveAllPages(stream, 'getUpdates', {
        headers: {
          'x-auth-token': token
        }
      },
      'detailedUpdates');
    });
  }

  getUpdatesBySegmentId(token, segmentId) {
    return new Promise(resolve => {
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'updatesBySegmentId', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          segmentId
        }
      },
      'detailedUpdates');
    });
  }

  getUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('getUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        const update = response.body;
        logger.debug('Update information retrieved:', update);
        resolve(update);
      }).catch(errResponse => {
        logger.debug('Update information request failure.');
        reject(errResponse.message);
      });
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

  createSegment(token, segment) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createSegment', {
        headers: {
          'x-auth-token': token
        },
        body: segment
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  createFilter(token, filter) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createFilter', {
        headers: {
          'x-auth-token': token
        },
        body: filter
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getFilterByName(token, filterName) {
    return new Promise((resolve, reject) => {
      this.getFilters(token).then(stream => {
        stream.onPageReceived(page => {
          const filter = page.find(filter => {
            return filter.name === filterName;
          });
          if (filter) {
            resolve(filter);
          }
        });
        stream.onLastPage(() => {
          reject('No filter with name ' + filterName + ' found.');
        });
        stream.onError(error => {
          reject(error);
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  getFilters(token) {
    return new Promise(resolve => {
      logger.debug('Getting filters');
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getFilters', {
        headers: {
          'x-auth-token': token
        }
      },
      'filters');
    });
  }

  editSegment(token, diff) {
    return new Promise((resolve, reject) => {
      this.getSegment(token, diff.id).then(segment => {
        return this.client.sendEndpointRequest('editSegment', {
          headers: {
            'x-auth-token': token
          },
          body: Object.assign({}, segment, diff),
          pathVariables: {
            id: segment.id
          }
        });
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

  getSegment(token, segmentId) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('getSegment', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          id: segmentId
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
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

  getSegmentDevices(token, segmentId) {
    return new Promise(resolve => {
      logger.debug('Getting devices for segment:', segmentId);
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getSegmentDevices', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          segmentId
        }
      },
      'devices');
    });
  }

  getDevices(token) {
    return new Promise(resolve => {
      logger.debug('Getting devices');
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getDevices', {
        headers: {
          'x-auth-token': token
        }
      },
      'devices');
    });
  }

  getDevicesFilteredByQuery(token, query) {
    return new Promise(resolve => {
      logger.debug('Getting devices with query:', query);
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getDevicesWithQuery', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          query: encodeURI(JSON.stringify(query))
        }
      },
        'devices');
    });
  }

  editUpdate(token, updateDiff) {
    return new Promise((resolve, reject) => {
      this.getUpdate(token, updateDiff.uuid).then(update => {
        const newUpdate = Object.assign({}, update, { packageId: update.packageInfo.id }, updateDiff);
        delete newUpdate.packageInfo;
        logger.debug('Editing update:', newUpdate);
        return this.client.sendEndpointRequest('editUpdate', {
          headers: {
            'x-auth-token': token
          },
          body: newUpdate,
          pathVariables: {
            uuid: newUpdate.uuid
          }
        });
      }).then(response => {
        const update = response.body;
        logger.debug('Edit update successful:', update);
        resolve(update);
      }).catch(errResponse => {
        logger.debug('Edit update failed:', errResponse);
        reject(errResponse.message);
      });
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

  createComponent(token, component) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createComponent', {
        headers: {
          'x-auth-token': token
        },
        body: component
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  checkUpdate(apiKey, device) {
    return new Promise((resolve, reject) => {
      logger.debug('checking update:', device);
      const client = new BarracksSDK({
        baseURL: this.options.baseUrl,
        apiKey,
        unitId: device.unitId
      });

      client.checkUpdate(device.versionId, device.customClientData).then(update => {
        if (update) {
          resolve(update);
        } else {
          resolve('No update available');
        }
      }).catch(err => {
        logger.debug('check update failed:', err);
        reject(err);
      });
    });
  }

  checkUpdateAndDownload(apiKey, device, path) {
    return new Promise((resolve, reject) => {
      logger.debug('check and download update:', device, path);
      const client = new BarracksSDK({
        baseURL: this.options.baseUrl,
        apiKey,
        unitId: device.unitId,
        downloadFilePath: path
      });

      client.checkUpdate(device.versionId, device.customClientData).then(update => {
        if (update) {
          update.download().then(file => {
            resolve(file);            
          });
        } else {
          resolve('No update available');
        }
      }).catch(err => {
        logger.debug('check and download update failed:', err);
        reject(err);
      });
    });
  }
}

module.exports = Barracks;
