const niv = require('npm-install-version');
const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;

niv.install('barracks-sdk@v2-beta', { quiet: true });
const BarracksSDK = niv.require('barracks-sdk@v2-beta');

class BarracksSDK2Proxy {

  constructor() {
    this.baseUrl = baseUrl;
  }

  resolveDevicePackages(apiKey, device) {
    return new Promise((resolve, reject) => {
      logger.debug('Checking update:', device);
      const sdk = new BarracksSDK({
        baseURL: this.baseUrl,
        apiKey,
        unitId: device.unitId
      });
      sdk.checkUpdate(device.packages, device.customClientData).then(packages => {
        resolve(packages);
      }).catch(err => {
        logger.debug('check update failed:', err);
        reject(err);
      });
    });
  }

}

module.exports = BarracksSDK2Proxy;