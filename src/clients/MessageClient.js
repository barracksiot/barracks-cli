const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

const endpoints = {
  sendMessage: {
    method: 'POST',
    path: '/api/messaging/messages?:query'
  },
  sendMessageToAll: {
    method: 'POST',
    path: '/api/messaging/messages?:query'
  }
};

class MessageClient {

  constructor() {
    this.httpClient = new HTTPClient();
    this.v2Enabled = config.v2Enabled;
  }

  sendMessage(token, message) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.sendMessage,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            query: 'unitId=' + encodeURI(message.unitId) + '&filter=' + encodeURI(message.filter) + '&retained=' + encodeURI(message.retained)
          },
          body: message.message
        }
      ).then(response => {
        logger.debug('Message sent to ' + message.unitId + ' and/or filter ' + message.filter + ' : ' + message.message);
        resolve(response.body);
      }).catch(err => {
        logger.debug('Failed to send message to ' + message.unitId + ' and/or ' + message.filter );
        reject(err.message);
      });
    });
  }

  sendMessageToAll(token, message) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.sendMessageToAll,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            query: 'retained=' + encodeURI(message.retained)
          },
          body: message.message
        }
      ).then(response => {
        logger.debug('Message sent to all devices' + ' : ' + message.message);
        resolve(response.body);
      }).catch(err => {
        logger.debug('failed to send message to all devices');
        reject(err.message);
      });
    });
  }
}

module.exports = MessageClient;