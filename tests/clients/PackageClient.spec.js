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

  describe('#createComponent()', () => {

    const componentRef = 'my.component.yo';
    const componentName = 'A cool component';
    const componentDescription = 'A very cool component';

    it('should return an error message when request fails', done => {
      // Given
      const component = { ref: componentRef, name: componentName, description: componentDescription };
      const error = { message: 'Error !' };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.createComponent(token, component).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'createComponent',
          {
            headers: { 'x-auth-token': token },
            body: component
          }
        );
        done();
      });
    });

    it('should return the component created', done => {
      // Given
      const component = { ref: componentRef, name: componentName, description: componentDescription };
      const response = { body: Object.assign({}, component, { id: 'theNewId' }) };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.createComponent(token, component).then(result => {
        expect(result).to.be.equals(response.body);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'createComponent',
          {
            headers: { 'x-auth-token': token },
            body: component
          }
        );
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
      const error = { message: 'Error !' };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getPackage(token, validPackage.reference).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getPackage', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            componentRef: validPackage.reference
          }
        });
        done();
      });
    });

    it('should return a package when request succeeds', done => {
      // Given
      const response = { body: validPackage };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getPackage(token, validPackage.reference).then(result => {
        expect(result).to.be.equals(validPackage);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getPackage', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            componentRef: validPackage.reference
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getComponent()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token }
      };

      packageClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      packageClient.getComponents(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getComponents',
          options,
          'components'
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
      component: 'ref.package',
      file: filePath,
      description: 'description',
      metadata: JSON.stringify({ data: 'value' })
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
        componentRef: version.component
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const proxypackageClient = new ProxifiedpackageClient();
      const error = { message: 'request failed' };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();
      proxypackageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      proxypackageClient.createVersion(token, version).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'createVersion',
          options
        );
        done();
      });
    });

    it('should return the serveur response body when request is successful', done => {
      // Given
      const proxypackageClient = new ProxifiedpackageClient();
      const response = { body: 'youpi created' };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();

      proxypackageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      proxypackageClient.createVersion(token, version).then(result => {
        expect(result).to.be.equals(response.body);
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxypackageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'createVersion',
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
      const error = { message: 'Error !' };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getVersion(token, packageRef, versionId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'getVersion',
          {
            headers: {
              'x-auth-token': token
            },
            pathVariables: {
              componentRef: packageRef,
              versionId
            }
          }
        );
        done();
      });
    });

    it('should return a token when request succeed', done => {
      // Given
      const version = { component: packageRef, id: versionId };
      const response = { body: version };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getVersion(token, packageRef, versionId).then(result => {
        expect(result).to.deep.equals(version);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'getVersion',
          {
            headers: {
              'x-auth-token': token
            },
            pathVariables: {
              componentRef: packageRef,
              versionId
            }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getComponentVersions()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const componentRef = 'my.component.ref';
      const options = {
        headers: {
          'x-auth-token': token
        },
        pathVariables: { componentRef }
      };
      packageClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      packageClient.getComponentVersions(token, componentRef).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(packageClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getComponentVersions',
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
      package: packageRef,
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.publishDeploymentPlan(token, validPlan).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'publishDeploymentPlan',
          {
            headers: {
              'x-auth-token': token
            },
            pathVariables: {
              componentRef: packageRef
            },
            body: validPlan
          }
        );
        done();
      });
    });

    it('should return the plan created', done => {
      // Given
      const plan = Object.assign({}, validPlan, { id: 'kjcxse456tyhjkloiuytrfd' });
      const response = { body: plan };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.publishDeploymentPlan(token, plan).then(result => {
        expect(result).to.be.equals(response.body);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          'publishDeploymentPlan',
          {
            headers: {
              'x-auth-token': token
            },
            pathVariables: {
              componentRef: packageRef
            },
            body: plan
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDeploymentPlan()', () => {
    const packageRef = 'ze.ref';
    const validDeploymentPlan = {
      package: packageRef,
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageClient.getDeploymentPlan(token, validDeploymentPlan.package).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getDeploymentPlan', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            componentRef: validDeploymentPlan.package
          }
        });
        done();
      });
    });

    it('should return a deployment plan when request succeed', done => {
      // Given
      const response = { body: validDeploymentPlan };
      packageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageClient.getDeploymentPlan(token, validDeploymentPlan.package).then(result => {
        expect(result).to.be.equals(validDeploymentPlan);
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(packageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getDeploymentPlan', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            componentRef: validDeploymentPlan.package
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});