const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');
const mqtt = require('mqtt');
var net = require('net');
var mqttpacket = require('mqtt-packet');


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
    this.sendMessage = this.sendMessage.bind(this);
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

  popMessage(apiKey, unitId) {
    return new Promise((resolve, reject) => {
      let messageConsumed = false;
      const mqttEndpoint = config.barracks.messaging.mqtt.endpoint;
      const client = mqtt.connect(mqttEndpoint, {
        clientId: unitId,
        username: apiKey,
        password: 'ignored but needed',
        clean: false,
        keepalive: 1000
      });

      client.on('connect', () => {
        logger.debug('Client connected to ' + mqttEndpoint);
        setTimeout(() => {
          client.end();
        }, 1000);
      });

      client.on('message', (topic, message) => {
        logger.debug('Received ' + message.toString() + 'on topic ' + topic);
        messageConsumed = true;
        client.end();
        resolve(message.toString());
        logger.debug('Client disconnected');
      });

      client.on('close', () => {
        if (!messageConsumed) {
          reject('No message to consume');
        }
      });
    });
  }
}

module.exports = MessageClient;