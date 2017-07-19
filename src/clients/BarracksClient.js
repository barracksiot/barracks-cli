/* jshint maxstatements: 11 */

const AccountClient = require('./AccountClient');
const DeviceClient = require('./DeviceClient');
const FilterClient = require('./FilterClient');
const MessageClient = require('./MessageClient');
const PackageClient = require('./PackageClient');
const SegmentClient = require('./SegmentClient');
const TokenClient = require('./TokenClient');
const UpdateClient = require('./UpdateClient');
const HookClient = require('./HookClient');
const BarracksSDKProxy = require('../utils/BarracksSDKProxy');
const BarracksSDK2Proxy = require('../utils/BarracksSDK2Proxy');
const BarracksMessagingSDKProxy = require('../utils/BarracksMessagingSDKProxy');

function mergeAccountClient(barracksClient) {
  const accountClient = new AccountClient();
  barracksClient.authenticate = accountClient.authenticate.bind(accountClient);
  barracksClient.getAccount = accountClient.getAccount.bind(accountClient);
  barracksClient.setGoogleAnalyticsTrackingId = accountClient.setGoogleAnalyticsTrackingId.bind(accountClient);
  barracksClient.setGoogleClientSecret = accountClient.setGoogleClientSecret.bind(accountClient);
  barracksClient.removeGoogleClientSecret = accountClient.removeGoogleClientSecret.bind(accountClient);
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
  barracksClient.updateFilter = filterClient.updateFilter.bind(filterClient);
  barracksClient.getFilter = filterClient.getFilter.bind(filterClient);
  barracksClient.getFilters = filterClient.getFilters.bind(filterClient);
  barracksClient.deleteFilter = filterClient.deleteFilter.bind(filterClient);
}

function mergeMessageClient(barracksClient) {
  const messageClient = new MessageClient();
  barracksClient.sendMessage = messageClient.sendMessage.bind(messageClient);
  barracksClient.sendMessageToAll = messageClient.sendMessageToAll.bind(messageClient);
}

function mergePackageClient(barracksClient) {
  const packageClient = new PackageClient();
  barracksClient.createPackage = packageClient.createPackage.bind(packageClient);
  barracksClient.getPackage = packageClient.getPackage.bind(packageClient);
  barracksClient.getPackages = packageClient.getPackages.bind(packageClient);
  barracksClient.createVersion = packageClient.createVersion.bind(packageClient);
  barracksClient.getVersion = packageClient.getVersion.bind(packageClient);
  barracksClient.getPackageVersions = packageClient.getPackageVersions.bind(packageClient);
  barracksClient.publishDeploymentPlan = packageClient.publishDeploymentPlan.bind(packageClient);
  barracksClient.getDeploymentPlan = packageClient.getDeploymentPlan.bind(packageClient);
}

function mergeSegmentClient(barracksClient) {
  const segmentClient = new SegmentClient();
  barracksClient.createSegment = segmentClient.createSegment.bind(segmentClient);
  barracksClient.editSegment = segmentClient.editSegment.bind(segmentClient);
  barracksClient.getSegmentByName = segmentClient.getSegmentByName.bind(segmentClient);
  barracksClient.getSegment = segmentClient.getSegment.bind(segmentClient);
  barracksClient.getSegments = segmentClient.getSegments.bind(segmentClient);
  barracksClient.setActiveSegments = segmentClient.setActiveSegments.bind(segmentClient);
}

function mergeTokenClient(barracksClient) {
  const tokenClient = new TokenClient();
  barracksClient.createToken = tokenClient.createToken.bind(tokenClient);
  barracksClient.getTokens = tokenClient.getTokens.bind(tokenClient);
  barracksClient.revokeToken = tokenClient.revokeToken.bind(tokenClient);
}

function mergeUpdateClient(barracksClient) {
  const updateClient = new UpdateClient();
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

function mergeHookClient(barracksClient) {
  const hookClient = new HookClient();
  barracksClient.createHook = hookClient.createHook.bind(hookClient);
  barracksClient.deleteHook = hookClient.deleteHook.bind(hookClient);
  barracksClient.getHooks = hookClient.getHooks.bind(hookClient);
}

function mergeSDKProxy(barracksClient) {
  const proxyV1 = new BarracksSDKProxy();
  barracksClient.checkUpdate = proxyV1.checkUpdate.bind(proxyV1);
  barracksClient.checkUpdateAndDownload = proxyV1.checkUpdateAndDownload.bind(proxyV1);
  const proxyV2 = new BarracksSDK2Proxy();
  barracksClient.resolveDevicePackages = proxyV2.resolveDevicePackages.bind(proxyV2);
}

function mergeMessagingSDKProxy(barracksClient) {
  const proxyMessaging = new BarracksMessagingSDKProxy();
  barracksClient.listenMessages = proxyMessaging.listenMessages.bind(proxyMessaging);
}

class BarracksClient {

  constructor() {
    mergeAccountClient(this);
    mergeDeviceClient(this);
    mergeFilterClient(this);
    mergeMessageClient(this);
    mergePackageClient(this);
    mergeSegmentClient(this);
    mergeTokenClient(this);
    mergeUpdateClient(this);
    mergeHookClient(this);
    mergeSDKProxy(this);
    mergeMessagingSDKProxy(this);
  }
}

module.exports = BarracksClient;