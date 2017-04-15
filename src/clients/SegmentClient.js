const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

class SegmentClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  createSegment(token, segment) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('createSegment', {
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

  editSegment(token, diff) {
    return new Promise((resolve, reject) => {
      this.getSegment(token, diff.id).then(segment => {
        return this.httpClient.sendEndpointRequest('editSegment', {
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
      this.httpClient.sendEndpointRequest('getSegment', {
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
      this.httpClient.sendEndpointRequest('getSegments', {
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

  setActiveSegments(token, segmentIds) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('setActiveSegments', {
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
}

module.exports = SegmentClient;