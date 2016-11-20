const request = require('request-promise');

function sendRequest(barracks, endpoint, options) {
  const requestUri = Object.getOwnPropertyNames(options.pathVariables || {}).reduce((uri, key) => {
    return uri.replace(`:${key}`, options.pathVariables[key]);
  }, barracks.options.baseUrl + barracks.options.endpoints[endpoint].path);
  return request(Object.assign({}, {
    method: barracks.options.endpoints[endpoint].method,
    uri: requestUri,
    json: true,
    resolveWithFullResponse: true
  }, options));
}

class Barracks {

  constructor(options) {
    this.options = options;
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      sendRequest(this, 'login', {
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
      sendRequest(this, 'me', {
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
      sendRequest(this, 'updates', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        resolve(response.body._embedded.memberUpdateInfoes);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  publishUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      sendRequest(this, 'publishUpdate', {
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
      sendRequest(this, 'archiveUpdate', {
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

};

module.exports = Barracks;