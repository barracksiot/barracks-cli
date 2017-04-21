const PageableStream = require('./PageableStream');
const HTTPClient = require('./HTTPClient');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const endpoints = {
  createPackage: {
    method: 'POST',
    path: '/v2/api/member/packages'
  },
  getPackage: {
    method: 'GET',
    path: '/v2/api/member/packages/:packageRef'
  },
  getPackages: {
    method: 'GET',
    path: '/v2/api/member/packages'
  },
  createVersion: {
    method: 'POST',
    path: '/v2/api/member/packages/:packageRef/versions'
  },
  getVersion: {
    method: 'GET',
    path: '/v2/api/member/packages/:packageRef/versions/:versionId'
  },
  getPackageVersions: {
    method: 'GET',
    path: '/v2/api/member/packages/:packageRef/versions'
  },
  publishDeploymentPlan: {
    method: 'POST',
    path: '/v2/api/member/packages/:packageRef/deployment-plan'
  },
  getDeploymentPlan: {
    method: 'GET',
    path: '/v2/api/member/packages/:packageRef/deployment-plan'
  }
};

class PackageClient {

  constructor() {
    this.httpClient = new HTTPClient();
  }

  createPackage(token, aPackage) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createPackage, {
          headers: {
            'x-auth-token': token
          },
          body: aPackage
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getPackage(token, packageRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting package from its reference', packageRef);
      this.httpClient.sendEndpointRequest(
        endpoints.getPackage, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef
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

  getPackages(token) {
    return new Promise(resolve => {
      logger.debug('Getting packages');
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getPackages, {
          headers: {
            'x-auth-token': token
          }
        },
        'packages'
      );
    });
  }

  createVersion(token, version) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.createVersion, {
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
            packageRef: version.packageRef
          }
        }
      ).then(response => {
        resolve(response.body);
      }).catch(err => {
        reject(err.message);
      });
    });
  }

  getVersion(token, packageRef, versionId) {
    return new Promise((resolve, reject) => {
      logger.debug(`Getting version ${versionId} of package ${packageRef}`);
      this.httpClient.sendEndpointRequest(
        endpoints.getVersion, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef,
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

  getPackageVersions(token, packageRef) {
    return new Promise(resolve => {
      logger.debug('Getting versions for packages', packageRef);
      const stream = new PageableStream();
      resolve(stream);
      this.httpClient.retrieveAllPages(
        stream,
        endpoints.getPackageVersions, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef
          }
        },
        'versions'
      );
    });
  }

  publishDeploymentPlan(token, plan) {
    return new Promise((resolve, reject) => {
      this.httpClient.sendEndpointRequest(
        endpoints.publishDeploymentPlan, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: plan.package
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

  getDeploymentPlan(token, packageRef) {
    return new Promise((resolve, reject) => {
      logger.debug('Getting DeploymentPlan for package', packageRef);
      this.httpClient.sendEndpointRequest(
        endpoints.getDeploymentPlan, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef
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
