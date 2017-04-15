const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');

class DeviceClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  getDevice(token, unitId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting device ${unitId}`);
      this.httpClient.sendEndpointRequest('getDevice', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          unitId
        }
      }).then(response => {
        const device = response.body;
        logger.debug('Device information retrieved:', device);
        resolve(device);
      }).catch(err => {
        logger.debug('get device request failure.');
        reject(err.message);
      });
    });
  }

  getDevices(token) {
    return new Promise(resolve => {
      logger.debug('Getting devices');
      const stream = new PageableStream();
      resolve(stream);
      const endpointKey = this.v2Enabled ? 'getDevicesV2' : 'getDevicesV1';
      this.httpClient.retrieveAllPages(stream, endpointKey, {
        headers: {
          'x-auth-token': token
        }
      },
      'devices');
    });
  }

  getDevicesFilteredByQuery(token, query) {
    return new Promise(resolve => {
      logger.debug('Getting devices with query:', query);
      const stream = new PageableStream();
      resolve(stream);
      const endpointKey = this.v2Enabled ? 'getDevicesWithQueryV2' : 'getDevicesWithQueryV1';
      this.httpClient.retrieveAllPages(stream, endpointKey, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            query: encodeURI(JSON.stringify(query))
          }
        },
        'devices');
    });
  }

  getDeviceEvents(token, unitId, fromDate) {
    return new Promise(resolve => {
      const resultStream = new PageableStream();
      const bufferStream = new PageableStream();
      resolve(resultStream);
      const endpointKey = this.v2Enabled ? 'getDeviceEventsV2' : 'getDeviceEventsV1';
      this.httpClient.retrievePagesUntilCondition(bufferStream, endpointKey, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            unitId
          }
        }, 'events', events =>
        fromDate && events.some(event => Date.parse(event.receptionDate) < Date.parse(fromDate))
      );
      bufferStream.onPageReceived(events => {
        const filteredEvents = events.filter(event =>
          Date.parse(fromDate || 0) < Date.parse(event.receptionDate)
        );
        if (filteredEvents.length > 0) {
          resultStream.write(filteredEvents);
        }
      });
      bufferStream.onLastPage(() => {
        resultStream.lastPage();
      });
    });
  }
}

module.exports = DeviceClient;