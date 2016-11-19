const request = require('request-promise');

class Barracks {

  constructor(options) {
    this.options = options;
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      request({
        method: this.options.endpoints.login.method,
        uri: this.options.baseUrl + this.options.endpoints.login.path,
        body: { username, password },
        json: true,
        resolveWithFullResponse: true
      }).then(response => {
        resolve(response.headers['x-auth-token']);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getAccount(token) {
    return new Promise((resolve, reject) => {
      request({
        method: this.options.endpoints.me.method,
        uri: this.options.baseUrl + this.options.endpoints.me.path,
        headers: {
          'x-auth-token': token
        },
        resolveWithFullResponse: true
      }).then(response => {
        resolve(JSON.parse(response.body));
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getUpdates(token) {
    return new Promise((resolve, reject) => {
      request({
        method: this.options.endpoints.updates.method,
        uri: this.options.baseUrl + this.options.endpoints.updates.path,
        headers: {
          'x-auth-token': token
        },
        resolveWithFullResponse: true
      }).then(response => {
        resolve(JSON.parse(response.body)._embedded.memberUpdateInfoes);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

};

module.exports = Barracks;