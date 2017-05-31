const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;
const BarracksMessengerSDK = require('barracks-messenger-sdk');

class BarracksMessagingSDKProxy {

  constructor() {
    this.baseUrl = baseUrl;
  }

  listenMessages(apiKey, device, timeout) {
    return new Promise((resolve, reject) => {
      const messengerSDK = new BarracksMessengerSDK({
        baseUrl: this.baseUrl,
        apiKey: apiKey
      });
      messengerSDK.listenMessages(apiKey, device.unitId, timeout).then(response => {
        resolve(response);
      }).catch(err => {
        logger.debug('Failed to listen to messages :', err);
        reject(err);
      });
    });
  }
}

module.exports = BarracksMessagingSDKProxy;