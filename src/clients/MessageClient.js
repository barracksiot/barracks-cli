const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');
const mqtt = require('mqtt');

const endpoints = {
  sendMessage: {
    method: 'POST',
    path: '/api/messaging/messages/:query'
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
          pathVariables: {
            query: '?unitId=' + encodeURI(message.unitId) + '&filter=' + encodeURI(message.filter)
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

  listenMessages(apiKey, unitId, timeout) {
    return new Promise((resolve, reject) => {
      const mqttEndpoint = config.barracks.messaging.mqtt.endpoint;
      const client = mqtt.connect(mqttEndpoint, {
        clientId: `${apiKey}.${unitId}`,
        clean: false
      });

      client.on('connect', () => {
        console.log('Connected to ' + mqttEndpoint);
        client.subscribe(`${apiKey}/${unitId}`, { qos: 2 });
      });

      client.on('message', (topic, message, packet) => {
        console.log('Received: ' + message.toString() + ' [retain=' + packet.retain + ']');
      });

      client.on('error', (error) => {
        logger.error(error);
        client.end();
        reject('Connection error:' + error);
      });

      client.on('close', () => {
        logger.debug('Connection closed');
        resolve();
      });

      if (timeout) {
        setTimeout(function () {
          client.end();
          resolve();
        }, timeout);
      }
    });
  }
}

module.exports = MessageClient;