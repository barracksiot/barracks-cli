const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

const endpoints = {
  sendMessage: {
    method: 'POST',
    path: '/v2/api/member/messages/send/:unitId'
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
            unitId: message.target
          },
          body: message.message
        }
      ).then(response => {
        logger.debug('Message sent to ' + message.target + ' : ' + message.message);
        resolve(response.body);
      }).catch(err => {
        logger.debug('failed to send message to' + message.target);
        reject(err.message);
      });
    });
  }
}

module.exports = MessageClient;