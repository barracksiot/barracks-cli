const niv = require('npm-install-version');
const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;

niv.install('barracks-sdk@v2-preview', { quiet: true });
const BarracksSDK = niv.require('barracks-sdk@v2-preview');

class BarracksSDK2Proxy {

  constructor() {
    this.baseUrl = baseUrl;
  }

  resolveDevicePackages(apiKey, device) {
    return new Promise((resolve, reject) => {
      logger.debug('Checking update:', device);
      const sdk = new BarracksSDK({
        baseURL: this.baseUrl,
        apiKey
      });
      sdk.getDevicePackages(device.unitId, device.packages, device.customClientData).then(response => {
        resolve(response);
      }).catch(err => {
        logger.debug('Resolve device packages failed:', err);
        reject(err);
      });
    });
  }

}

module.exports = BarracksSDK2Proxy;