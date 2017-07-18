const HTTPClient = require('./HTTPClient');

const endpoints = {
  createHook: {
    method: 'POST',
    path: '/api/dispatcher/hooks'
  }
};

class HookClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createHook(token, hook) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createHook,
        {
          headers: {
            'x-auth-token': token
          },
          body: hook
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }
}

module.exports = HookClient;