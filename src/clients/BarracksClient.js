const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const BarracksSDK = require('barracks-sdk');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

class Barracks {

  constructor(options) {
    this.options = options;
    this.client = new HTTPClient(options);
    this.v2Enabled = config.v2Enabled;
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      logger.debug('Authenticating:', username);
      this.client.sendEndpointRequest('login', {
        body: { username, password }
      }).then(response => {
        logger.debug('Authentication successful.');
        resolve(response.headers['x-auth-token']);
      }).catch(err => {
        logger.debug('Authentication failure.');
        reject(err.message);
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
      }).catch(err => {
        logger.debug('Account information request failure.');
        reject(err.message);
      });
    });
  }

  setGoogleAnalyticsTrackingId(token, googleId) {
    return new Promise((resolve, reject) => {
      logger.debug('Setting Google Analytics Id:', googleId);
      this.client.sendEndpointRequest('setGoogleAnalyticsTrackingId',
        {
          headers: {
            'x-auth-token': token
          },
          body: {
            value: googleId
          }
        }).then(response => {
        logger.debug('GA Id setted successful.');
        resolve(response.body);
      }).catch(err => {
        logger.debug('GA Id set failure.');
        reject(err.message);
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
        'updates');
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
        'updates');
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
      }).catch(err => {
        logger.debug('Update information request failure.');
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  createFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'createFilterV2' : 'createFilterV1';
      this.client.sendEndpointRequest(endpointKey, {
        headers: {
          'x-auth-token': token
        },
        body: filter
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  deleteFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'deleteFilterV2' : 'deleteFilterV1';
      this.client.sendEndpointRequest(endpointKey, {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          filter
        }
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getFilterByName(token, filterName) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('getFilter', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          filter: filterName
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getFilters(token) {
    return new Promise(resolve => {
      logger.debug('Getting filters');
      const stream = new PageableStream();
      resolve(stream);
      const endpointKey = this.v2Enabled ? 'getFiltersV2' : 'getFiltersV1';
      this.client.retrieveAllPages(stream, endpointKey, {
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
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getSegmentByName(token, segmentName) {
    return new Promise((resolve, reject) => {
      this.getSegments(token).then(segments => {
        const segment = segments.active.concat(segments.inactive, segments.other).find(segment => {
          return segment.name === segmentName;
        });
        if (segment) {
          resolve(segment);
        } else {
          reject('No matching segment.');
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
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        logger.debug('Get user segments failed with:', err);
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
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
      const endpointKey = this.v2Enabled ? 'getDevicesV2' : 'getDevicesV1';
      this.client.retrieveAllPages(stream, endpointKey, {
        headers: {
          'x-auth-token': token
        }
      },
      'devices');
    });
  }

  getDevice(token, unitId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting device ${unitId}`);
      this.client.sendEndpointRequest('getDevice', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          unitId
        }
      }).then(response => {
        const device = response.body;
        logger.debug('Device information retrieved:', device);
        resolve(device);
      }).catch(err => {
        logger.debug('get device request failure.');
        reject(err.message);
      });
    });
  }

  getDevicesFilteredByQuery(token, query) {
    return new Promise(resolve => {
      logger.debug('Getting devices with query:', query);
      const stream = new PageableStream();
      resolve(stream);
      const endpointKey = this.v2Enabled ? 'getDevicesWithQueryV2' : 'getDevicesWithQueryV1';
      this.client.retrieveAllPages(stream, endpointKey, {
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

  getDeviceEvents(token, unitId, fromDate) {
    return new Promise(resolve => {
      const resultStream = new PageableStream();
      const bufferStream = new PageableStream();
      resolve(resultStream);
      const endpointKey = this.v2Enabled ? 'getDeviceEventsV2' : 'getDeviceEventsV1';
      this.client.retrievePagesUntilCondition(bufferStream, endpointKey, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            unitId
          }
        }, 'events', events =>
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
      }).catch(err => {
        logger.debug('Edit update failed:', err);
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  createToken(token, tokenConfiguration) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createToken', {
        headers: {
          'x-auth-token': token
        },
        body: tokenConfiguration
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getTokens(token) {
    return new Promise(resolve => {
      logger.debug('Getting tokens');
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(
        stream,
        'getTokens',
        { headers: { 'x-auth-token': token } },
        'tokens'
      );
    });
  }

  revokeToken(authToken, tokenToRevoke) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('revokeToken', {
        headers: {
          'x-auth-token': authToken
        },
        pathVariables: {
          token: tokenToRevoke
        }
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
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
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getComponents(token) {
    return new Promise(resolve => {
      logger.debug('Getting components');
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(stream, 'getComponents', {
          headers: {
            'x-auth-token': token
          }
        },
        'components');
    });
  }

  createVersion(token, version) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('createVersion', {
        headers: {
          'x-auth-token': token
        },
        formData: {
          version: {
            value: JSON.stringify({
              id: version.id,
              name: version.name,
              description: version.description,
              metadata: version.metadata
            }),
            options: {
              contentType: 'application/json'
            }
          },
          file: {
            value: fs.createReadStream(version.file),
            options: {
              filename: path.basename(version.file),
              contentType: 'application/octet-stream'
            }
          }
        },
        pathVariables: {
          componentRef: version.component
        }
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  publishDeploymentPlan(token, plan) {
    return new Promise((resolve, reject) => {
      this.client.sendEndpointRequest('publishDeploymentPlan', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef: plan.package
        },
        body: plan
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getComponentVersions(token, componentRef) {
    return new Promise(resolve => {
      logger.debug('Getting versions for components', componentRef);
      const stream = new PageableStream();
      resolve(stream);
      this.client.retrieveAllPages(
        stream,
        'getComponentVersions',
        {
          headers: { 'x-auth-token': token },
          pathVariables: { componentRef }
        },
        'versions'
      );
    });
  }

  getVersion(token, componentRef, versionId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting version ${versionId} of component ${componentRef}`);
      this.client.sendEndpointRequest(
        'getVersion',
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            componentRef,
            versionId
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
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

  getDeploymentPlan(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting DeploymentPlan for component', componentRef);
      this.client.sendEndpointRequest('getDeploymentPlan', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef
        }
      }).then(response => {
        const deploymentPlan = response.body;
        logger.debug('DeploymentPlan retrieved:', deploymentPlan);
        resolve(deploymentPlan);
      }).catch(err => {
        logger.debug('Failed to retrieve DeploymentPlan');
        reject(err.message);
      });
    });
  }

  getPackage(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting package from its reference', componentRef);
      this.client.sendEndpointRequest('getPackage', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef
        }
      }).then(response => {
        const myPackage = response.body;
        logger.debug('Package retrieved:', myPackage);
        resolve(myPackage);
      }).catch(err => {
        logger.debug('Failed to retrieve package');
        reject(err.message);
      });
    });
  }
}

module.exports = Barracks;