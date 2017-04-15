/* jshint maxstatements: 10 */

const HTTPClient = require('./HTTPClient');
const AccountClient = require('./AccountClient');
const DeviceClient = require('./DeviceClient');
const FilterClient = require('./FilterClient');
const PackageClient = require('./PackageClient');
const SegmentClient = require('./SegmentClient');
const TokenClient = require('./TokenClient');
const UpdateClient = require('./UpdateClient');
const BarracksSDK = require('barracks-sdk');
const logger = require('../utils/logger');
const config = require('../config');

function mergeAccountClient(barracksClient, options) {
  const accountClient = new AccountClient(options);
  barracksClient.authenticate = accountClient.authenticate.bind(accountClient);
  barracksClient.getAccount = accountClient.getAccount.bind(accountClient);
  barracksClient.setGoogleAnalyticsTrackingId = accountClient.setGoogleAnalyticsTrackingId.bind(accountClient);
}

function mergeDeviceClient(barracksClient, options) {
  const deviceClient = new DeviceClient(options);
  barracksClient.getDevice = deviceClient.getDevice.bind(deviceClient);
  barracksClient.getDevices = deviceClient.getDevices.bind(deviceClient);
  barracksClient.getDevicesFilteredByQuery = deviceClient.getDevicesFilteredByQuery.bind(deviceClient);
  barracksClient.getDevicesBySegment = deviceClient.getDevicesBySegment.bind(deviceClient);
  barracksClient.getDeviceEvents = deviceClient.getDeviceEvents.bind(deviceClient);
}

function mergeFilterClient(barracksClient, options) {
  const filterClient = new FilterClient(options);
  barracksClient.createFilter = filterClient.createFilter.bind(filterClient);
  barracksClient.getFilter = filterClient.getFilter.bind(filterClient);
  barracksClient.getFilters = filterClient.getFilters.bind(filterClient);
  barracksClient.deleteFilter = filterClient.deleteFilter.bind(filterClient);
}

function mergePackageClient(barracksClient, options) {
  const packageClient = new PackageClient(options);
  barracksClient.createComponent = packageClient.createComponent.bind(packageClient);
  barracksClient.getPackage = packageClient.getPackage.bind(packageClient);
  barracksClient.getComponents = packageClient.getComponents.bind(packageClient);
  barracksClient.createVersion = packageClient.createVersion.bind(packageClient);
  barracksClient.getVersion = packageClient.getVersion.bind(packageClient);
  barracksClient.getComponentVersions = packageClient.getComponentVersions.bind(packageClient);
  barracksClient.publishDeploymentPlan = packageClient.publishDeploymentPlan.bind(packageClient);
  barracksClient.getDeploymentPlan = packageClient.getDeploymentPlan.bind(packageClient);
}

function mergeSegmentClient(barracksClient, options) {
  const segmentClient = new SegmentClient(options);
  barracksClient.createSegment = segmentClient.createSegment.bind(segmentClient);
  barracksClient.editSegment = segmentClient.editSegment.bind(segmentClient);
  barracksClient.getSegmentByName = segmentClient.getSegmentByName.bind(segmentClient);
  barracksClient.getSegment = segmentClient.getSegment.bind(segmentClient);
  barracksClient.getSegments = segmentClient.getSegments.bind(segmentClient);
  barracksClient.setActiveSegments = segmentClient.setActiveSegments.bind(segmentClient);
}

function mergeTokenClient(barracksClient, options) {
  const tokenClient = new TokenClient(options);
  barracksClient.createToken = tokenClient.createToken.bind(tokenClient);
  barracksClient.getTokens = tokenClient.getTokens.bind(tokenClient);
  barracksClient.revokeToken = tokenClient.revokeToken.bind(tokenClient);
}

function mergeUpdateClient(barracksClient, options) {
  const updateClient = new UpdateClient(options);
  barracksClient.createUpdate = updateClient.createUpdate.bind(updateClient);
  barracksClient.createUpdatePackage = updateClient.createUpdatePackage.bind(updateClient);
  barracksClient.editUpdate = updateClient.editUpdate.bind(updateClient);
  barracksClient.getUpdate = updateClient.getUpdate.bind(updateClient);
  barracksClient.getUpdates = updateClient.getUpdates.bind(updateClient);
  barracksClient.getUpdatesBySegmentId = updateClient.getUpdatesBySegmentId.bind(updateClient);
  barracksClient.publishUpdate = updateClient.publishUpdate.bind(updateClient);
  barracksClient.archiveUpdate = updateClient.archiveUpdate.bind(updateClient);
  barracksClient.scheduleUpdate = updateClient.scheduleUpdate.bind(updateClient);
}

class BarracksClient {

  constructor(options) {
    this.options = options;
    this.client = new HTTPClient(options);
    this.v2Enabled = config.v2Enabled;

    mergeAccountClient(this, options);
    mergeDeviceClient(this, options);
    mergeFilterClient(this, options);
    mergePackageClient(this, options);
    mergeSegmentClient(this, options);
    mergeTokenClient(this, options);
    mergeUpdateClient(this, options);
  }

  checkUpdate(apiKey, device) {
    return new Promise((resolve, reject) => {
      logger.debug('checking update:', device);
      const client = new BarracksSDK({
        baseURL: this.options.baseUrl,
        apiKey,
        unitId: device.unitId
      });

      client.checkUpdate(device.versionId, device.customClientData).then(update => {
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
      const client = new BarracksSDK({
        baseURL: this.options.baseUrl,
        apiKey,
        unitId: device.unitId,
        downloadFilePath: path
      });

      client.checkUpdate(device.versionId, device.customClientData).then(update => {
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

module.exports = BarracksClient;