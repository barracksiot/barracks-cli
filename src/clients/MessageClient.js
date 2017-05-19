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

  listen(info) {
    const client = mqtt.connect('mqtt://' + info.host, {
      clientId: info.deviceId,
      username: info.username,
      password: 'azerty',
      clean: false,
      keepalive: 0
    });

    const that = this;

    client.on('connect', () => {
      const message = {
        target: info.deviceId,
        message: 'Bonjour monsieur ' + info.deviceId
      };
      const token = 'eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI3NDQyOTA5Yy0yNjZkLTRlM2EtODNiZS05Y2JkYjJlN2E2N2QiLCJzdWIiOiJkYXJrcm95MTRAb3JhbmdlLmZyIiwiaWF0IjoxNDk1MjE3MzU4LCJleHAiOjE0OTUzMDM3NTh9.yCR7f2hWnvdDsnGnmOKs0tsY3bRlZsSMFKeB-fz5dqJ0ryoMVzL64gYN5NjgEvDYXQ6n6pNE0lsmIQr3ercSYg';
      const tokenDdns = 'eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJmOWIzYzQ4NC00NTZkLTRhMGEtOGQwZS0wOTE1NGRiZmUxNjIiLCJzdWIiOiJ2bGFkaW1pckBiYXJyYWNrcy5pbyIsImlhdCI6MTQ5NTIwNzE5MiwiZXhwIjoxNDk1MjkzNTkyfQ.SkApqA7IxmrNyu5QeO350Eh8UQgQIJEOJce1wNptbM3-0U_kx9AHT6Iy4epbdBhPoqoEf0r04ZF2hHvUh2Rd-g';
      that.sendMessage(tokenDdns, message).then(() => {
        console.log('Le message envoyé est : ' + message.message);
      });
    });

    client.on('message', (topic, message) => {
        console.log('Received ' + message + 'on topic ' + topic);

    });

  }
}

module.exports = MessageClient;