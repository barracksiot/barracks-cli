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
  },
  setGoogleAnalyticsTrackingId: {
    method: 'PUT',
    path: '/api/auth/me/gaTrackingId'
  },
  setGoogleClientSecret: {
    method: 'PUT',
    path: '/api/auth/me/googleClientSecret'
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

  setGoogleAnalyticsTrackingId(token, googleId) {
    return new Promise((resolve, reject) => {
      logger.debug('Setting Google Analytics Id:', googleId);
      this.httpClient.sendEndpointRequest(
        endpoints.setGoogleAnalyticsTrackingId,
        {
          headers: {
            'x-auth-token': token
          },
          body: {
            value: googleId
          }
        }
      ).then(response => {
        logger.debug('GA Id successfully set.');
        resolve(response.body);
      }).catch(err => {
        logger.debug('GA Id setting failed.');
        reject(err.message);
      });
    });
  }

  setGoogleClientSecret(token, secret) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.setGoogleClientSecret,
        {
          headers: {
            'x-auth-token': token
          },
          body: secret
        }
      ).then(response => {
        logger.debug('Google Client Secret successfully set.');
        resolve(response.body);
      }).catch(err => {
        logger.debug('Google Client Secret setting failed.');
        reject(err.message);
      });
    });
  }
}

module.exports = AccountClient;