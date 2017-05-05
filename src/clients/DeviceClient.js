const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const config = require('../config');

const endpoints = {
  getDeviceV1: {
    method: 'GET',
    path: '/api/member/devices/:unitId'
  },
  getDeviceV2: {
    method: 'GET',
    path: '/v2/api/member/devices/:unitId'
  },
  getDevicesV1: {
    method: 'GET',
    path: '/api/member/devices?size=20'
  },
  getDevicesV2: {
    method: 'GET',
    path: '/v2/api/member/devices?size=20'
  },
  getDevicesWithQueryV1: {
    method: 'GET',
    path: '/api/member/devices?size=20&query=:query'
  },
  getDevicesWithQueryV2: {
    method: 'GET',
    path: '/v2/api/member/devices?size=20&query=:query'
  },
  getDevicesBySegment: {
    method: 'GET',
    path: '/api/member/segments/:segmentId/devices'
  },
  getDeviceEventsV1: {
    method: 'GET',
    path: '/api/member/devices/:unitId/events?size=20&sort=receptionDate,DESC'
  },
  getDeviceEventsV2: {
    method: 'GET',
    path: '/v2/api/member/devices/:unitId/events?size=20&sort=receptionDate,DESC'
  }
};

class DeviceClient {

  constructor() {
    this.httpClient = new HTTPClient();
    this.v2Enabled = config.v2Enabled;
  }

  getDevice(token, unitId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting device ${unitId}`);
      const endpointKey = this.v2Enabled ? 'getDeviceV2' : 'getDeviceV1';
      this.httpClient.sendEndpointRequest(
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            unitId
          }
        }
      ).then(response => {
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
      this.httpClient.retrieveAllPages(stream,
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          }
        },
        'devices'
      );
    });
  }

  getDevicesFilteredByQuery(token, query) {
    return new Promise(resolve => {
      logger.debug('Getting devices with query:', query);
      const stream = new PageableStream();
      resolve(stream);
      const endpointKey = this.v2Enabled ? 'getDevicesWithQueryV2' : 'getDevicesWithQueryV1';
      this.httpClient.retrieveAllPages(stream,
        endpoints[endpointKey],
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            query: encodeURI(JSON.stringify(query))
          }
        },
        'devices'
      );
    });
  }

  getDevicesBySegment(token, segmentId) {
    return new Promise(resolve => {
      logger.debug('Getting devices for segment:', segmentId);
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(stream,
        endpoints.getDevicesBySegment,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            segmentId
          }
        },
        'devices'
      );
    });
  }

  getDeviceEvents(token, unitId, fromDate) {
    return new Promise(resolve => {
      const resultStream = new PageableStream();
      const bufferStream = new PageableStream();
      resolve(resultStream);
      const endpointKey = this.v2Enabled ? 'getDeviceEventsV2' : 'getDeviceEventsV1';
      this.httpClient.retrievePagesUntilCondition(bufferStream,
        endpoints[endpointKey],
        {
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