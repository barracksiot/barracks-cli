const barracksClientPath = '../../src/clients/BarracksClient';
const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const Barracks = require(barracksClientPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Barracks', () => {

  let barracks;
  let mockedCreateReadStream = undefined;
  let mockedBasename = undefined;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {};

  beforeEach(() => {
    barracks = new Barracks();
    barracks.client = {};
    barracks.v2Enabled = false;
  });

  describe('#constructor()', () => {

    let barracksClient;

    beforeEach(() => {
      barracksClient = undefined;
    });

    it('should initialize methods from accountClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('authenticate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getAccount').and.to.be.a('function');
      expect(barracksClient).to.have.property('setGoogleAnalyticsTrackingId').and.to.be.a('function');
    });

    it('should initialize methods from deviceClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('getDevice').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevices').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevicesFilteredByQuery').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevicesBySegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDeviceEvents').and.to.be.a('function');
    });

    it('should initialize methods from filterClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createFilter').and.to.be.a('function');
      expect(barracksClient).to.have.property('getFilter').and.to.be.a('function');
      expect(barracksClient).to.have.property('getFilters').and.to.be.a('function');
      expect(barracksClient).to.have.property('deleteFilter').and.to.be.a('function');
    });

    it('should initialize methods from segmentClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('editSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegmentByName').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegments').and.to.be.a('function');
      expect(barracksClient).to.have.property('setActiveSegments').and.to.be.a('function');
    });

    it('should initialize methods from tokenClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createToken').and.to.be.a('function');
      expect(barracksClient).to.have.property('getTokens').and.to.be.a('function');
      expect(barracksClient).to.have.property('revokeToken').and.to.be.a('function');
    });

    it('should initialize methods from updateClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('editUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdates').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdatesBySegmentId').and.to.be.a('function');
      expect(barracksClient).to.have.property('publishUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('archiveUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('scheduleUpdate').and.to.be.a('function');
    });
  });

  describe('#createPackage()', () => {

    beforeEach(() => {
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        fs: {
          createReadStream: file => {
            return mockedCreateReadStream(file)
          }
        },
        path: {
          basename: file => {
            return mockedBasename(file)
          }
        }
      });

      barracks = new ProxifiedBarracks();
    });

    it('should return the package created', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      const response = { body: 'coucou' }
      const fileReadStream = 'fileReadStream';
      const file = 'file';
      const versionId = 'version';
      const package = { versionId, file };

      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));
      mockedCreateReadStream = sinon.stub().returns(fileReadStream);
      mockedBasename = sinon.stub().returns(file);

      // When / Then
      barracks.createPackage(token, package).then(result => {
        expect(result).to.be.equals(response.body);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createPackage',
          {
            headers: { 'x-auth-token': token },
            formData: {
              versionId: versionId,
              file: {
                value: fileReadStream,
                options: { filename: file }
              }
            }
          }
        );
        expect(mockedCreateReadStream).to.have.been.calledOnce;
        expect(mockedCreateReadStream).to.have.been.calledWithExactly(file);
        expect(mockedBasename).to.have.been.calledOnce;
        expect(mockedBasename).to.have.been.calledWithExactly(file);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error if request fails', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      const response = { message: 'error' }
      const fileReadStream = 'fileReadStream';
      const file = 'file';
      const versionId = 'version';
      const package = { versionId, file };

      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(response));
      mockedCreateReadStream = sinon.stub().returns(fileReadStream);
      mockedBasename = sinon.stub().returns(file);

      // When / Then
      barracks.createPackage(token, package).then(result => {
        done('shoud have failed');
      }).catch(err => {
        expect(err).to.be.equals(response.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createPackage',
          {
            headers: { 'x-auth-token': token },
            formData: {
              versionId: versionId,
              file: {
                value: fileReadStream,
                options: { filename: file }
              }
            }
          }
        );
        expect(mockedCreateReadStream).to.have.been.calledOnce;
        expect(mockedCreateReadStream).to.have.been.calledWithExactly(file);
        expect(mockedBasename).to.have.been.calledOnce;
        expect(mockedBasename).to.have.been.calledWithExactly(file);
        done();
      });
    });
  });

  describe('#createComponent()', () => {

    const componentRef = 'my.component.yo';
    const componentName = 'A cool component';
    const componentDescription = 'A very cool component';

    it('should return an error message when request fails', done => {
      // Given
      const component = { ref: componentRef, name: componentName, description: componentDescription };
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.createComponent(token, component).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.createComponent(token, component).then(result => {
        expect(result).to.be.equals(response.body);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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

  describe('#getComponent()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token }
      };

      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getComponents(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
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

    const ProxifiedBarracks = proxyquire(barracksClientPath, {
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
      const proxyBarracks = new ProxifiedBarracks();
      const error = { message: 'request failed' };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();
      proxyBarracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      proxyBarracks.createVersion(token, version).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(proxyBarracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxyBarracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createVersion',
          options
        );
        done();
      });
    });

    it('should return the serveur response body when request is successful', done => {
      // Given
      const proxyBarracks = new ProxifiedBarracks();
      const response = { body: 'youpi created' };
      spyCreateReadStream = sinon.spy();
      spyBasename = sinon.spy();

      proxyBarracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      proxyBarracks.createVersion(token, version).then(result => {
        expect(result).to.be.equals(response.body);
        expect(proxyBarracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(proxyBarracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createVersion',
          options
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.publishDeploymentPlan(token, validPlan).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.publishDeploymentPlan(token, plan).then(result => {
        expect(result).to.be.equals(response.body);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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

  describe('#checkUpdate()', () => {

    it('should reject an error if client fail', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      });
    });

    it('should return a message if no update available', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(undefined));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals('No update available');
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call client with empty customClientData when device with no customClientData given', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call client with customClientData when device with customClientData given', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const customClientData = { data1: 'value', data2: 4 };
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId, customClientData };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          customClientData
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
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getComponentVersions(token, componentRef).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
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

  describe('#getVersion()', () => {

    const packageRef = 'io.barracks.package';
    const versionId = '3.29.5';

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getVersion(token, packageRef, versionId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getVersion(token, packageRef, versionId).then(result => {
        expect(result).to.deep.equals(version);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
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

  describe('#checkUpdateAndDownload()', () => {

    const baseUrl = 'base/url';
    const apiKey = 'myApiKey';
    const unitId = 'unitId';
    const versionId = 'version1';
    const filePath = 'path/to/update';

    it('should reject an error if client fail', done => {
      // Given
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      });
    });

    it('should return a message if no update available', done => {
      // Given
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(undefined));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        expect(result).to.be.equals('No update available');
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call download if an update is available', done => {
      // Given
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const file = 'testFile';
      const downloadSpy = sinon.stub().returns(Promise.resolve(file));
      const update = { download: downloadSpy };
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(update));
      const ProxifiedBarracks = proxyquire(barracksClientPath, {
        'barracks-sdk': function Constructor(options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };

      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        expect(result).to.be.equals(file);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        expect(downloadSpy).to.have.been.calledOnce;
        expect(downloadSpy).to.have.been.calledWithExactly();
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getDeploymentPlan(token, validDeploymentPlan.package).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getDeploymentPlan', {
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getDeploymentPlan(token, validDeploymentPlan.package).then(result => {
        expect(result).to.be.equals(validDeploymentPlan);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getDeploymentPlan', {
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getPackage(token, validPackage.reference).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getPackage', {
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
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getPackage(token, validPackage.reference).then(result => {
        expect(result).to.be.equals(validPackage);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getPackage', {
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
});
