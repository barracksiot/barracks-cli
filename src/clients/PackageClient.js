const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const endpoints = {
  createComponent: {
    method: 'POST',
    path: '/v2/api/member/components'
  },
  getPackage: {
    method: 'GET',
    path: '/v2/api/member/components/:componentRef'
  },
  getComponents: {
    method: 'GET',
    path: '/v2/api/member/components'
  },
  createVersion: {
    method: 'POST',
    path: '/v2/api/member/components/:componentRef/versions'
  },
  getVersion: {
    method: 'GET',
    path: '/v2/api/member/components/:componentRef/versions/:versionId'
  },
  getComponentVersions: {
    method: 'GET',
    path: '/v2/api/member/components/:componentRef/versions'
  },
  publishDeploymentPlan: {
    method: 'POST',
    path: '/v2/api/member/components/:componentRef/deployment-plan'
  },
  getDeploymentPlan: {
    method: 'GET',
    path: '/v2/api/member/components/:componentRef/deployment-plan'
  }
};

class PackageClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createComponent(token, component) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createComponent,
        {
          headers: {
            'x-auth-token': token
          },
          body: component
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getPackage(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting package from its reference', componentRef);
      this.httpClient.sendEndpointRequest(
        endpoints.getPackage,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            componentRef
          }
        }
      ).then(response => {
        const myPackage = response.body;
        logger.debug('Package retrieved:', myPackage);
        resolve(myPackage);
      }).catch(err => {
        logger.debug('Failed to retrieve package');
        reject(err.message);
      });
    });
  }

  getComponents(token) {
    return new Promise(resolve => {
      logger.debug('Getting components');
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getComponents,
        {
          headers: {
            'x-auth-token': token
          }
        },
        'components'
      );
    });
  }

  createVersion(token, version) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createVersion,
        {
          headers: {
            'x-auth-token': token
          },
          formData: {
            version: {
              value: JSON.stringify({
                id: version.id,
                name: version.name,
                description: version.description,
                metadata: version.metadata
              }),
              options: {
                contentType: 'application/json'
              }
            },
            file: {
              value: fs.createReadStream(version.file),
              options: {
                filename: path.basename(version.file),
                contentType: 'application/octet-stream'
              }
            }
          },
          pathVariables: {
            componentRef: version.component
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getVersion(token, componentRef, versionId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting version ${versionId} of component ${componentRef}`);
      this.httpClient.sendEndpointRequest(
        endpoints.getVersion,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            componentRef,
            versionId
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getComponentVersions(token, componentRef) {
    return new Promise(resolve => {
      logger.debug('Getting versions for components', componentRef);
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getComponentVersions,
        {
          headers: { 'x-auth-token': token },
          pathVariables: { componentRef }
        },
        'versions'
      );
    });
  }

  publishDeploymentPlan(token, plan) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.publishDeploymentPlan,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            componentRef: plan.package
          },
          body: plan
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getDeploymentPlan(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting DeploymentPlan for component', componentRef);
      this.httpClient.sendEndpointRequest(
        endpoints.getDeploymentPlan,
        {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            componentRef
          }
        }
      ).then(response => {
        const deploymentPlan = response.body;
        logger.debug('DeploymentPlan retrieved:', deploymentPlan);
        resolve(deploymentPlan);
      }).catch(err => {
        logger.debug('Failed to retrieve DeploymentPlan');
        reject(err.message);
      });
    });
  }
}

module.exports = PackageClient;