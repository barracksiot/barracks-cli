const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

const endpoints = {
  login: {
    method: 'POST',
    path: '/api/auth/login'
  },
  me: {
    method: 'GET',
    path: '/api/auth/me'
  }
};

class AccountClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      logger.debug(`Authenticating ${username}`);
      this.httpClient.sendEndpointRequest(
        endpoints.login,
        {
          body: { username, password }
        }
      ).then(response => {
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
      this.httpClient.sendEndpointRequest(
        endpoints.me,
        {
          headers: {
            'x-auth-token': token
          }
        }
      ).then(response => {
        const account = response.body;
        logger.debug('Account information retrieved:', account);
        resolve(account);
      }).catch(err => {
        logger.debug('Account information request failure.');
        reject(err.message);
      });
    });
  }
}

module.exports = AccountClient;