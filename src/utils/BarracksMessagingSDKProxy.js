const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;
const BarracksMessengerSDK = require('barracks-messenger-sdk-betatest');

class BarracksMessagingSDKProxy {

  constructor() {
    this.baseUrl = baseUrl;
  }

  listenMessages(apiKey, unitId, timeout) {
    return new Promise((resolve, reject) => {
      const messengerSDK = new BarracksMessengerSDK({
        baseUrl: this.baseUrl,
        apiKey: apiKey
      });
      messengerSDK.listenMessages(apiKey, unitId, timeout).then(response => {
        console.log('log du listen dans barracksmessagingsdkproxy');
        resolve(response);
        console.log('un autre log très sympa');
      }).catch(err => {
        logger.debug('Failed to listen to messages :', err);
        reject(err);
      });
    });
  }
}

module.exports = BarracksMessagingSDKProxy;