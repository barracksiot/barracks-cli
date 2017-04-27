const sdkProxyPath = '../../src/utils/BarracksSDK2Proxy';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BarracksSDKProxy = require(sdkProxyPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

function getProxifiedBarracks(constructorSpy, getDevicePackagesSpy) {
  return proxyquire(sdkProxyPath, {
    'npm-install-version': {
      install: sinon.spy(),
      require: sinon.stub().returns(function Constructor(options) {
        constructorSpy(options);
        this.getDevicePackages = getDevicePackagesSpy;
      })
    }
  });
}

describe('BarracksSDK2Proxy', () => {

  const baseUrl = 'http://barracks.io';
  const apiKey = 'myApiKey';
  const unitId = 'unitId';
  const versionId = 'version1';
  
  describe('#resolveDevicePackages()', () => {

    const packages = [
      {
        reference: "io.baracks.app1",
        version: "0.0.1"
      },
      {
        reference: "io.baracks.app2",
        version: "0.0.3"
      }
    ];

    it('should reject an error if client fail', done => {
      // Given
      const error = 'blah error';
      const device = { unitId, packages };
      const constructorSpy = sinon.spy();
      const getDevicePackagesSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, getDevicePackagesSpy);
      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.resolveDevicePackages(apiKey, device).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey
        });
        expect(getDevicePackagesSpy).to.have.been.calledOnce;
        expect(getDevicePackagesSpy).to.have.been.calledWithExactly(
          unitId,
          packages,
          undefined
        );
        done();
      });
    });
  
    it('should call client with empty customClientData when device with no customClientData given', done => {
      // Given
      const response = { a: 'response' };
      const device = { unitId, packages };
      const constructorSpy = sinon.spy();
      const getDevicePackagesSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, getDevicePackagesSpy);

      barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.resolveDevicePackages(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey
        });
        expect(getDevicePackagesSpy).to.have.been.calledOnce;
        expect(getDevicePackagesSpy).to.have.been.calledWithExactly(
          unitId,
          packages,
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
      const response = { a: 'response' };
      const device = { unitId, packages, customClientData };
      const constructorSpy = sinon.spy();
      const getDevicePackagesSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, getDevicePackagesSpy);

      barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.resolveDevicePackages(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey
        });
        expect(getDevicePackagesSpy).to.have.been.calledOnce;
        expect(getDevicePackagesSpy).to.have.been.calledWithExactly(
          unitId,
          packages,
          customClientData
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

});