const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

const endpoints = {
  createToken: {
    method: 'POST',
    path: '/api/auth/tokens'
  },
  getTokens: {
    method: 'GET',
    path: '/api/auth/tokens'
  },
  revokeToken: {
    method: 'PUT',
    path: '/api/auth/tokens/:token/revoke'
  }
};

class TokenClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createToken(token, tokenConfiguration) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createToken,
        {
          headers: {
            'x-auth-token': token
          },
          body: tokenConfiguration
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getTokens(token) {
    return new Promise(resolve => {
      logger.debug('Getting tokens');
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getTokens,
        {
          headers: {
            'x-auth-token': token
          }
        },
        'tokens'
      );
    });
  }

  revokeToken(authToken, tokenToRevoke) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.revokeToken,
        {
          headers: {
            'x-auth-token': authToken
          },
          pathVariables: {
            token: tokenToRevoke
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

module.exports = TokenClient;