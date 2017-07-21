const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

const endpoints = {
  createHook: {
    method: 'POST',
    path: '/api/dispatcher/hooks'
  },
  getHooks: {
    method: 'GET',
    path: '/api/dispatcher/hooks'
  },
  deleteHook: {
    method: 'DELETE',
    path: '/api/dispatcher/hooks/:hook'
  }
};

class HookClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createHook(token, hook) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createHook,
        {
          headers: {
            'x-auth-token': token
          },
          body: hook
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        if (err.statusCode === 400) {
          reject('A hook with this name already exists.');
        }
        else {
          reject(err.message);
        }
      });
    });
  }

  deleteHook(token, hook) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.deleteHook,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            hook
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        if (err.statusCode === 404) {
          reject('The hook you are trying to remove does not exist.');
        }
        else {
          reject(err.message);
        }
      });
    });
  }

}

module.exports = HookClient;