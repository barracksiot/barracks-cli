const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

class AccountClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      logger.debug('Authenticating:', username);
      this.httpClient.sendEndpointRequest('login', {
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
      this.httpClient.sendEndpointRequest('me', {
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
      this.httpClient.sendEndpointRequest('setGoogleAnalyticsTrackingId',
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
}

module.exports = AccountClient;