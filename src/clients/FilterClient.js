const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

class FilterClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
    this.v2Enabled = config.v2Enabled;
  }

  createFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'createFilterV2' : 'createFilterV1';
      this.httpClient.sendEndpointRequest(endpointKey, {
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

  getFilter(token, filterName) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('getFilter', {
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
      this.httpClient.retrieveAllPages(stream, endpointKey, {
          headers: {
            'x-auth-token': token
          }
        },
        'filters');
    });
  }

  deleteFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'deleteFilterV2' : 'deleteFilterV1';
      this.httpClient.sendEndpointRequest(endpointKey, {
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
}

module.exports = FilterClient;