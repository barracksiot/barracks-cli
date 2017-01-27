const request = require('request-promise');

function sendRequest(method, uri, options) {
  return request(Object.assign({}, {
    method: method,
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }, options));
}

class HTTPClient {

  constructor(serverInfo) {
    this.serverInfo = serverInfo;
  }

  buildEndpointUri(endpoint, options) {
    return Object.getOwnPropertyNames(options.pathVariables || {}).reduce((uri, key) => {
      return uri.replace(`:${key}`, options.pathVariables[key]);
    }, this.serverInfo.baseUrl + this.serverInfo.endpoints[endpoint].path);
  }

  sendEndpointRequest(endpoint, options) {
    const requestUri = this.buildEndpointUri(endpoint, options);
    return sendRequest(this.serverInfo.endpoints[endpoint].method, requestUri, options);
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
    sendRequest('GET', uri, options).then(response => {
      if (response.body._embedded) {
        const items = response.body._embedded[embeddedKey];
        pageableStream.write(items);
        if (response.body._links.next && (!stopCondition || !stopCondition(items))) {
          this.retrieveNextPages(pageableStream, response.body._links.next.href, options, embeddedKey, stopCondition);
        } else {
          pageableStream.lastPage();
        }
      } else {
        pageableStream.lastPage();
      }
    }).catch(errResponse => {
      pageableStream.fail(errResponse);
    });
  }
}

module.exports = HTTPClient;