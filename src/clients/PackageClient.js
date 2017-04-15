const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class PackageClient {

  constructor(options) {
    this.options = options;
    this.httpClient = new HTTPClient(options);
  }

  createComponent(token, component) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('createComponent', {
        headers: {
          'x-auth-token': token
        },
        body: component
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getPackage(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting package from its reference', componentRef);
      this.httpClient.sendEndpointRequest('getPackage', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef
        }
      }).then(response => {
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
      this.httpClient.retrieveAllPages(stream, 'getComponents', {
          headers: {
            'x-auth-token': token
          }
        },
        'components');
    });
  }

  createVersion(token, version) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest('createVersion', {
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
      }).then(response => {
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
        'getVersion',
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
        'getComponentVersions',
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
      this.httpClient.sendEndpointRequest('publishDeploymentPlan', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef: plan.package
        },
        body: plan
      }).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getDeploymentPlan(token, componentRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting DeploymentPlan for component', componentRef);
      this.httpClient.sendEndpointRequest('getDeploymentPlan', {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          componentRef
        }
      }).then(response => {
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