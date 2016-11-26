const PageableStream = require('./PageableStream');
const request = require('request-promise');
const fs = require('fs');
const path = require('path');

function sendEndpointRequest(barracks, endpoint, options) {
  const requestUri = Object.getOwnPropertyNames(options.pathVariables || {}).reduce((uri, key) => {
    return uri.replace(`:${key}`, options.pathVariables[key]);
  }, barracks.options.baseUrl + barracks.options.endpoints[endpoint].path);
  return sendRequest(barracks, barracks.options.endpoints[endpoint].method, requestUri, options);
}


function sendRequest(barracks, method, uri, options) {
  return request(Object.assign({}, {
    method: method,
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }, options));
}

function retrieveAllPages(barracks, pageableStream, endpoint, options) {  
  retrieveNextPages(
    barracks,
    pageableStream,
    barracks.options.baseUrl + barracks.options.endpoints[endpoint].path,
    options
  );
}

function retrieveNextPages(barracks, pageableStream, uri, options) {
  sendRequest(barracks, 'GET', uri, options).then(response => {
    pageableStream.write(response.body._embedded.memberUpdateInfoes);
    if (response.body._links.next) {
      retrieveNextPages(barracks, pageableStream, response.body._links.next.href, options);
    } else {
      pageableStream.lastPage();
    }
  }).catch(errResponse => {
    pageableStream.fail(errResponse);
  });
}

class Barracks {

  constructor(options) {
    this.options = options;
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'login', {
        body: { username, password }
      }).then(response => {
        resolve(response.headers['x-auth-token']);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getAccount(token) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'me', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getUpdates(token) {
    return new Promise((resolve, reject) => {
      const stream = new PageableStream();
      resolve(stream);
      retrieveAllPages(this, stream, 'updates', {
        headers: {
          'x-auth-token': token
        }
      });
    });
  }

  publishUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'publishUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  archiveUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'archiveUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  scheduleUpdate(token, uuid) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'archiveUpdate', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          uuid
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  createPackage(token, updatePackage) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'createPackage', {
        headers: {
          'x-auth-token': token
        },
        formData: {
          versionId: updatePackage.versionId,
          file: {
            value: fs.createReadStream(updatePackage.file),
            options: {
              filename: path.basename(updatePackage.file)
            }
          }
        }
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  getChannelByName(token, channelName) {
    return new Promise((resolve, reject) => {
      this.getChannels(token).then(channels => {
        const channel = channels.find(channel => {
          return channel.name === channelName;
        });
        if (channel) {
          resolve(channel);
        } else {
          reject('No matching channel name');
        }
      }).catch(err => {
        reject(err);
      });
    });
  }

  getChannels(token) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'getChannels', {
        headers: {
          'x-auth-token': token
        }
      }).then(response => {
        resolve(response.body._embedded.channels);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

  createUpdate(token, update) {
    return new Promise((resolve, reject) => {
      sendEndpointRequest(this, 'createUpdate', {
        headers: {
          'x-auth-token': token
        },
        body: update
      }).then(response => {
        resolve(response.body);
      }).catch(errResponse => {
        reject(errResponse.message);
      });
    });
  }

};

module.exports = Barracks;