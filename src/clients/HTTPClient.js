const logger = require('../utils/logger');
const request = require('request-promise');
const baseUrl = require('../config').barracks.baseUrl;

function sendRequest(method, uri, options) {
  logger.debug('Sending request to', uri);
  return request(Object.assign({}, {
    method: method,
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }, options));
}

function isPage(body) {
  return !!body._embedded;
}

class HTTPClient {

  constructor() {
    this.baseUrl = baseUrl;
  }

  buildEndpointUri(endpoint, options) {
    return Object.getOwnPropertyNames(options.pathVariables || {}).reduce((uri, key) => {
      return uri.replace(`:${key}`, options.pathVariables[key]);
    }, this.baseUrl + endpoint.path);
  }

  sendEndpointRequest(endpoint, options) {
    const requestUri = this.buildEndpointUri(endpoint, options);
    return sendRequest(endpoint.method, requestUri, options);
  }

  retrievePagesUntilCondition(pageableStream, endpoint, options, embeddedKey, stopCondition) {
    this.retrieveNextPages(
      pageableStream,
      this.buildEndpointUri(endpoint, options),
      options,
      embeddedKey,
      stopCondition
    );
  }

  retrieveAllPages(pageableStream, endpoint, options, embeddedKey) {
    this.retrieveNextPages(
      pageableStream,
      this.buildEndpointUri(endpoint, options),
      options,
      embeddedKey
    );
  }

  retrieveNextPages(pageableStream, uri, options, embeddedKey, stopCondition) {
    return new Promise(resolve => {
      sendRequest('GET', uri, options).then(response => {
        if (isPage(response.body)) {
          this.handlePage(pageableStream, response.body, options, embeddedKey, stopCondition);
        } else {
          pageableStream.lastPage();
        }
        resolve();
      }).catch(errResponse => {
        pageableStream.fail(errResponse);
        resolve();
      });
    });
  }

  handlePage(pageableStream, page, options, embeddedKey, stopCondition) {
    const items = page._embedded[embeddedKey];
    pageableStream.write(items);
    if (page._links.next && (!stopCondition || !stopCondition(items))) {
      this.retrieveNextPages(pageableStream, page._links.next.href, options, embeddedKey, stopCondition);
    } else {
      pageableStream.lastPage();
    }
  }

}

module.exports = HTTPClient;