const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

class BarracksClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  createUpdate(token, update) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('createUpdate', {
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

  editUpdate(token, updateDiff) {
    return new Promise((resolve, reject) => {
      this.getUpdate(token, updateDiff.uuid).then(update => {
        const newUpdate = Object.assign({}, update, { packageId: update.packageInfo.id }, updateDiff);
        delete newUpdate.packageInfo;
        logger.debug('Editing update:', newUpdate);
        return this.httpClient.sendEndpointRequest('editUpdate', {
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

  getUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('getUpdate', {
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

  getUpdates(token) {
    return new Promise(resolve => {
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(stream, 'getUpdates', {
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
      this.httpClient.retrieveAllPages(stream, 'updatesBySegmentId', {
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

  publishUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('publishUpdate', {
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
      this.httpClient.sendEndpointRequest('archiveUpdate', {
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
      this.httpClient.sendEndpointRequest('scheduleUpdate', {
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

}

module.exports = BarracksClient;