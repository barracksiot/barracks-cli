const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

const endpoints = {
  createFilterV1: {
    method: 'POST',
    path: '/api/member/filters'
  },
  createFilterV2: {
    method: 'POST',
    path: '/v2/api/member/filters'
  },
  updateFilterV2: {
    method: 'POST',
    path: '/v2/api/member/filters/:filter'
  },
  getFilter: {
    method: 'GET',
    path: '/v2/api/member/filters/:filter'
  },
  getFiltersV1: {
    method: 'GET',
    path: '/api/member/filters?size=20'
  },
  getFiltersV2: {
    method: 'GET',
    path: '/v2/api/member/filters?size=20'
  },
  deleteFilterV1: {
    method: 'DELETE',
    path: '/api/member/filters/:filter'
  },
  deleteFilterV2: {
    method: 'DELETE',
    path: '/v2/api/member/filters/:filter'
  }
};

class FilterClient {

  constructor() {
    this.httpClient = new HTTPClient();
    this.v2Enabled = config.v2Enabled;
  }

  createFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'createFilterV2' : 'createFilterV1';
      this.httpClient.sendEndpointRequest(
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          },
          body: filter
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  updateFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = 'updateFilterV2';
      this.httpClient.sendEndpointRequest(
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            filter: filter.name
          },
          body: filter.query
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getFilter(token, filterName) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.getFilter,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            filter: filterName
          }
        }
      ).then(response => {
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
      this.httpClient.retrieveAllPages(
        stream,
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          }
        },
        'filters'
      );
    });
  }

  deleteFilter(token, filter) {
    return new Promise((resolve, reject) => {
      const endpointKey = this.v2Enabled ? 'deleteFilterV2' : 'deleteFilterV1';
      this.httpClient.sendEndpointRequest(
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            filter
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

module.exports = FilterClient;