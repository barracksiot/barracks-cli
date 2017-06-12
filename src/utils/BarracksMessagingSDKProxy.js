const baseUrl = require('../config').barracks.baseUrl;
const mqttEndpoint = require('../config').barracks.messaging.mqtt.endpoint;
const BarracksMessengerSDK = require('barracks-messenger-sdk');

class BarracksMessagingSDKProxy {

  constructor() {
    this.baseUrl = baseUrl;
    this.mqttEndpoint = mqttEndpoint;
  }

  listenMessages(apiKey, unitId, timeout) {
    return new Promise((resolve, reject) => {
      const barracksMessenger = new BarracksMessengerSDK.BarracksMessenger({
        baseUrl: this.baseUrl,
        mqttEndpoint,
        unitId,
        apiKey
      });

      barracksMessenger.connect({
        onConnect: function () {
          console.log('Connected to ' + barracksMessenger.options.mqttEndpoint);
        },
        onError: function (err) {
          console.log('Error occurred : ' + err);
          reject(err);
        },
        onClose: function () {
          console.log('Connection closed');
        },
        onReconnect: function () {
          console.log('On Reconnect');
        }
      });
      barracksMessenger.subscribe(function (messageReceived) {
        console.log('Received: ' + messageReceived.payload);
        console.log('retain : ' + messageReceived.retained);
        console.log('topic : ' + messageReceived.topic);
        console.log('length: ' + messageReceived.length);
        console.log('qos ' + messageReceived.qos);
      }, { qos: 1 });

      if (timeout) {
        setTimeout(function () {
          barracksMessenger.end();
          resolve();
        }, timeout);
      }
    });
  }
}

module.exports = BarracksMessagingSDKProxy;