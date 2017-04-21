const packageClientPath = '../../src/clients/PackageClient';
const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const PackageClient = require(packageClientPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PackageClient', () => {

  let packageClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    packageClient = new PackageClient();
    packageClient.httpClient = {};
  });

  describe('#createPackage()', () => {

    const packageRef = 'my.package.yo';
    const packageName = 'A cool package';
    const packageDescription = 'A very cool package';

    it('should return an error message when request fails', done => {
      // Given
      const aPackage = {
        ref: packageRef,
        name: packageName,
        description: packageDescription
      };
      const error = {
        message: 'Error !'
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.createPackage(token, aPackage).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'POST',
          path: '/v2/api/member/packages'
        }, {
          headers: {
            'x-auth-token': token
          },
          body: aPackage
        });
        done();
      });
    });

    it('should return the package created', done => {
      // Given
      const aPackage = {
        ref: packageRef,
        name: packageName,
        description: packageDescription
      };
      const response = {
        body: Object.assign({}, aPackage, {
          id: 'theNewId'
        })
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.createPackage(token, aPackage).then(result => {
        expect(result).to.be.equals(response.body);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'POST',
          path: '/v2/api/member/packages'
        }, {
          headers: {
            'x-auth-token': token
          },
          body: aPackage
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getPackage()', () => {
    const packageRef = 'ze.ref';
    const validPackage = {
      id: "id",
      user: "userId",
      reference: packageRef,
      description: "description",
      name: "packageName"
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = {
        message: 'Error !'
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getPackage(token, validPackage.reference).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: validPackage.reference
          }
        });
        done();
      });
    });

    it('should return a package when request succeeds', done => {
      // Given
      const response = {
        body: validPackage
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getPackage(token, validPackage.reference).then(result => {
        expect(result).to.be.equals(validPackage);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: validPackage.reference
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getPackage()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const options = {
        headers: {
          'x-auth-token': token
        }
      };

      packageClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      packageClient.getPackages(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(), {
            method: 'GET',
            path: '/v2/api/member/packages'
          },
          options,
          'packages'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#createVersion()', () => {

    const filename = 'file.txt';
    const filePath = 'path/to/file.txt';
    const version = {
      id: '2.0',
      name: 'version 2',
      packageRef: 'ref.package',
      file: filePath,
      description: 'description',
      metadata: JSON.stringify({
        data: 'value'
      })
    };

    let spyCreateReadStream;
    const proxyCreateReadStream = (path) => {
      spyCreateReadStream(path);
      return filename;
    };

    let spyBasename;
    const proxyBasename = (path) => {
      spyBasename(path);
      return filename;
    };

    const ProxifiedpackageClient = proxyquire(packageClientPath, {
      fs: {
        createReadStream: (path) => {
          return proxyCreateReadStream(path);
        }
      },
      path: {
        basename: (path) => {
          return proxyBasename(path);
        }
      }
    });

    const options = {
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
          value: filename,
          options: {
            filename: filename,
            contentType: 'application/octet-stream'
          }
        }
      },
      pathVariables: {
        packageRef: version.packageRef
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const proxypackageClient = new ProxifiedpackageClient();
      const error = {
        message: 'request failed'
      };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();
      proxypackageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      proxypackageClient.createVersion(token, version).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
            method: 'POST',
            path: '/v2/api/member/packages/:packageRef/versions'
          },
          options
        );
        done();
      });
    });

    it('should return the serveur response body when request is successful', done => {
      // Given
      const proxypackageClient = new ProxifiedpackageClient();
      const response = {
        body: 'youpi created'
      };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();

      proxypackageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      proxypackageClient.createVersion(token, version).then(result => {
        expect(result).to.be.equals(response.body);
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
            method: 'POST',
            path: '/v2/api/member/packages/:packageRef/versions'
          },
          options
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getVersion()', () => {

    const packageRef = 'io.packageClient.package';
    const versionId = '3.29.5';

    it('should return an error message when request fails', done => {
      // Given
      const error = {
        message: 'Error !'
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getVersion(token, packageRef, versionId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef/versions/:versionId'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: packageRef,
            versionId
          }
        });
        done();
      });
    });

    it('should return a token when request succeed', done => {
      // Given
      const version = {
        packageRef: packageRef,
        id: versionId
      };
      const response = {
        body: version
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getVersion(token, packageRef, versionId).then(result => {
        expect(result).to.deep.equals(version);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef/versions/:versionId'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: packageRef,
            versionId
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getPackageVersions()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const packageRef = 'my.package.ref';
      const options = {
        headers: {
          'x-auth-token': token
        },
        pathVariables: {
          packageRef
        }
      };
      packageClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      packageClient.getPackageVersions(token, packageRef).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(), {
            method: 'GET',
            path: '/v2/api/member/packages/:packageRef/versions'
          },
          options,
          'versions'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#publishDeploymentPlan()', () => {

    const packageRef = 'ze.ref';
    const validPlan = {
      packageRef: packageRef,
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = {
        message: 'Error !'
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.publishDeploymentPlan(token, validPlan).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'POST',
          path: '/v2/api/member/packages/:packageRef/deployment-plan'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: packageRef
          },
          body: validPlan
        });
        done();
      });
    });

    it('should return the plan created', done => {
      // Given
      const plan = Object.assign({}, validPlan, {
        id: 'kjcxse456tyhjkloiuytrfd'
      });
      const response = {
        body: plan
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.publishDeploymentPlan(token, plan).then(result => {
        expect(result).to.be.equals(response.body);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'POST',
          path: '/v2/api/member/packages/:packageRef/deployment-plan'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: packageRef
          },
          body: plan
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDeploymentPlan()', () => {
    const packageRef = 'ze.ref';
    const validDeploymentPlan = {
      packageRef: packageRef,
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = {
        message: 'Error !'
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getDeploymentPlan(token, validDeploymentPlan.packageRef).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef/deployment-plan'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: validDeploymentPlan.package
          }
        });
        done();
      });
    });

    it('should return a deployment plan when request succeed', done => {
      // Given
      const response = {
        body: validDeploymentPlan
      };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getDeploymentPlan(token, validDeploymentPlan.package).then(result => {
        expect(result).to.be.equals(validDeploymentPlan);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly({
          method: 'GET',
          path: '/v2/api/member/packages/:packageRef/deployment-plan'
        }, {
          headers: {
            'x-auth-token': token
          },
          pathVariables: {
            packageRef: validDeploymentPlan.package
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
