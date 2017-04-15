const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

class TokenClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  createToken(token, tokenConfiguration) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('createToken', {
        headers: {
          'x-auth-token': token
        },
        body: tokenConfiguration
      }).then(response => {
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
        'getTokens',
        { headers: { 'x-auth-token': token } },
        'tokens'
      );
    });
  }

  revokeToken(authToken, tokenToRevoke) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('revokeToken', {
        headers: {
          'x-auth-token': authToken
        },
        pathVariables: {
          token: tokenToRevoke
        }
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }
}

module.exports = TokenClient;