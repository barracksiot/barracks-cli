const niv = require('npm-install-version');
const logger = require('../utils/logger');
const baseUrl = require('../config').barracks.baseUrl;

niv.install('barracks-sdk@0.0.2', { quiet: true });
const BarracksSDK = niv.require('barracks-sdk@0.0.2');

class BarracksSDKProxy {

  constructor() {
    this.baseUrl = baseUrl;
  }

  checkUpdate(apiKey, device) {
    return new Promise((resolve, reject) => {
      logger.debug('checking update:', device);
      const sdk = new BarracksSDK({
        baseURL: this.baseUrl,
        apiKey,
        unitId: device.unitId
      });

      sdk.checkUpdate(device.versionId, device.customClientData).then(update => {
        if (update) {
          resolve(update);
        } else {
          resolve('No update available');
        }
      }).catch(err => {
        logger.debug('check update failed:', err);
        reject(err);
      });
    });
  }

  checkUpdateAndDownload(apiKey, device, path) {
    return new Promise((resolve, reject) => {
      logger.debug('check and download update:', device, path);
      const sdk = new BarracksSDK({
        baseURL: this.baseUrl,
        apiKey,
        unitId: device.unitId,
        downloadFilePath: path
      });

      sdk.checkUpdate(device.versionId, device.customClientData).then(update => {
        if (update) {
          update.download().then(file => {
            resolve(file);
          });
        } else {
          resolve('No update available');
        }
      }).catch(err => {
        logger.debug('check and download update failed:', err);
        reject(err);
      });
    });
  }
}

module.exports = BarracksSDKProxy;