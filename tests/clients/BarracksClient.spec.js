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

    it('should initialize methods from packageClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createComponent').and.to.be.a('function');
      expect(barracksClient).to.have.property('getPackage').and.to.be.a('function');
      expect(barracksClient).to.have.property('getComponents').and.to.be.a('function');
      expect(barracksClient).to.have.property('createVersion').and.to.be.a('function');
      expect(barracksClient).to.have.property('getVersion').and.to.be.a('function');
      expect(barracksClient).to.have.property('getComponentVersions').and.to.be.a('function');
      expect(barracksClient).to.have.property('publishDeploymentPlan').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDeploymentPlan').and.to.be.a('function');
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
});
