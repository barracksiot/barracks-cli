/* jshint maxstatements: 11 */

const AccountClient = require('./AccountClient');
const DeviceClient = require('./DeviceClient');
const FilterClient = require('./FilterClient');
const PackageClient = require('./PackageClient');
const SegmentClient = require('./SegmentClient');
const TokenClient = require('./TokenClient');
const UpdateClient = require('./UpdateClient');
const BarracksSDKProxy = require('../utils/BarracksSDKProxy');

function mergeAccountClient(barracksClient) {
  const accountClient = new AccountClient();
  barracksClient.authenticate = accountClient.authenticate.bind(accountClient);
  barracksClient.getAccount = accountClient.getAccount.bind(accountClient);
  barracksClient.setGoogleAnalyticsTrackingId = accountClient.setGoogleAnalyticsTrackingId.bind(accountClient);
}

function mergeDeviceClient(barracksClient) {
  const deviceClient = new DeviceClient();
  barracksClient.getDevice = deviceClient.getDevice.bind(deviceClient);
  barracksClient.getDevices = deviceClient.getDevices.bind(deviceClient);
  barracksClient.getDevicesFilteredByQuery = deviceClient.getDevicesFilteredByQuery.bind(deviceClient);
  barracksClient.getDevicesBySegment = deviceClient.getDevicesBySegment.bind(deviceClient);
  barracksClient.getDeviceEvents = deviceClient.getDeviceEvents.bind(deviceClient);
}

function mergeFilterClient(barracksClient) {
  const filterClient = new FilterClient();
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

function mergeSDKProxy(barracksClient, options) {
  const proxy = new BarracksSDKProxy(options);
  barracksClient.checkUpdate = proxy.checkUpdate.bind(proxy);
  barracksClient.checkUpdateAndDownload = proxy.checkUpdateAndDownload.bind(proxy);
}

class BarracksClient {

  constructor(options) {
    mergeAccountClient(this);
    mergeDeviceClient(this);
    mergeFilterClient(this);
    mergePackageClient(this, options);
    mergeSegmentClient(this, options);
    mergeTokenClient(this, options);
    mergeUpdateClient(this, options);
    mergeSDKProxy(this, options);
  }
}

module.exports = BarracksClient;