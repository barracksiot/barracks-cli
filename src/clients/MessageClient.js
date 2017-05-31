const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

const endpoints = {
  sendMessage: {
    method: 'POST',
    path: '/api/messaging/messages?unitId=:unitId'
  },
  sendMessageToAll: {
    method: 'POST',
    path: '/api/messaging/messages'
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
          pathParameters: {
            unitId: message.unitId
          },
          body: message.message
        }
      ).then(response => {
        logger.debug('Message sent to ' + message.unitId + ' : ' + message.message);
        resolve(response.body);
      }).catch(err => {
        logger.debug('failed to send message to' + message.unitId);
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