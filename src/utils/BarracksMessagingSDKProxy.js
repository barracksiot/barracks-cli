const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;
const mqttEndpoint = require('../config').barracks.messaging.mqtt.endpoint;
const BarracksMessengerSDK = require('barracks-messenger-sdk-betatest');

class BarracksMessagingSDKProxy {

  constructor() {
    this.baseUrl = baseUrl;
    this.mqttEndpoint = mqttEndpoint;
  }

  listenMessages(apiKey, unitId, timeout) {
    return new Promise((resolve, reject) => {
      const barracksMessenger = new BarracksMessengerSDK({
        baseUrl: this.baseUrl,
        mqttEndpoint: mqttEndpoint,
        unitId: unitId,
        apiKey: apiKey
      });
      barracksMessenger.connect({
        onConnect: function() {
          console.log('Connected to ' + barracksMessenger.options.mqttEndpoint);
        },
        onError: function(err) {
          console.log('Error occurred : ' + err);
          reject(err);
        },
        onClose: function() {
          console.log('Connection closed');
        },
        onReconnect: function() {
          console.log('On Reconnect');
        }
      });

      barracksMessenger.subscribe(barracksMessenger.options.apiKey + '.' + barracksMessenger.options.unitId, function(messageReceived) {
        console.log('Received: ' + messageReceived.payload);
        console.log('retain : ' + messageReceived.retained + ' // topic : ' + messageReceived.topic);
        console.log('length: ' + messageReceived.length);
        console.log('qos ' + messageReceived.qos);
      }, { qos: 1 });

      setTimeout(function () {
        barracksMessenger.end();
        resolve();
      }, timeout);
    });
  }
}

module.exports = BarracksMessagingSDKProxy;