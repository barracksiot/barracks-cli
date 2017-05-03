const sdkProxyPath = '../../src/utils/BarracksSDKProxy';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BarracksSDKProxy = require(sdkProxyPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

function getProxifiedBarracks(constructorSpy, checkUpdateSpy) {
  return proxyquire(sdkProxyPath, {
    'multidep': function () {
      return function Constructor(options) {
        constructorSpy(options);
        this.checkUpdate = checkUpdateSpy;
      };
    }
  });
}

describe('BarracksSDKProxy', () => {

  const baseUrl = 'http://barracks.io';
  const apiKey = 'myApiKey';
  const unitId = 'unitId';
  const versionId = 'version1';
  
  describe('#checkUpdate()', () => {

    it('should reject an error if client fail', done => {
      // Given
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(undefined));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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
      const customClientData = { data1: 'value', data2: 4 };
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId, customClientData };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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

    const filePath = 'path/to/update';

    it('should reject an error if client fail', done => {
      // Given
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, checkUpdateSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

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