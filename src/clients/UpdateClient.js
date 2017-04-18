const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const endpoints = {
  createUpdate: {
    method: 'POST',
    path: '/api/member/updates'
  },
  createUpdatePackage: {
    method: 'POST',
    path: '/api/member/packages'
  },
  editUpdate: {
    method: 'PUT',
    path: '/api/member/updates/:uuid'
  },
  getUpdate: {
    method: 'GET',
    path: '/api/member/updates/:uuid'
  },
  getUpdates: {
    method: 'GET',
    path: '/api/member/updates?size=20'
  },
  updatesBySegmentId: {
    method: 'GET',
    path: '/api/member/segments/:segmentId/updates'
  },
  publishUpdate: {
    method: 'PUT',
    path: '/api/member/updates/:uuid/status/published'
  },
  archiveUpdate: {
    method: 'PUT',
    path: '/api/member/updates/:uuid/status/archived'
  },
  scheduleUpdate: {
    method: 'PUT',
    path: '/api/member/updates/:uuid/status/scheduled?time=:time'
  }
};

class BarracksClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createUpdate(token, update) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createUpdate,
        {
          headers: {
            'x-auth-token': token
          },
          body: update
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  createUpdatePackage(token, updatePackage) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createUpdatePackage,
        {
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
        }
      ).then(response => {
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
        return this.httpClient.sendEndpointRequest(
          endpoints.editUpdate,
          {
            headers: {
              'x-auth-token': token
            },
            body: newUpdate,
            pathVariables: {
              uuid: newUpdate.uuid
            }
          }
        );
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
      this.httpClient.sendEndpointRequest(
        endpoints.getUpdate,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            uuid
          }
        }
      ).then(response => {
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
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getUpdates,
        {
          headers: {
            'x-auth-token': token
          }
        },
        'updates'
      );
    });
  }

  getUpdatesBySegmentId(token, segmentId) {
    return new Promise(resolve => {
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.updatesBySegmentId,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            segmentId
          }
        },
        'updates'
      );
    });
  }

  publishUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.publishUpdate,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            uuid
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  archiveUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.archiveUpdate,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            uuid
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  scheduleUpdate(token, uuid, date) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.scheduleUpdate,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            uuid,
            time: date.toISOString()
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

}

module.exports = BarracksClient;