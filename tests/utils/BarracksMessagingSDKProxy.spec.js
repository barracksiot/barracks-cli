const messagingSDKProxyPath = '../../src/utils/BarracksMessagingSDKProxy';
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BarracksSDKProxy = require(messagingSDKProxyPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

function getProxifiedBarracks(constructorSpy, listenMessagesSpy) {
  return proxyquire(messagingSDKProxyPath, {
    'barracks-messenger-sdk-betatest':  function Constructor(options) {
      constructorSpy(options);
      this.listenMessages = listenMessagesSpy;
    }
  });
}

describe('BarracksMessagingSDKProxy', () => {

  const baseUrl = 'https://app.barracks.io';
  const apiKey = 'myApiKey';
  const unitId = 'unitId';
  const timeout = 60000;

  describe('#listenMessages()', () => {

    const message = 'Bonjour !';

    it('should reject an error if client fails', done => {
      // Given
      const error = 'error';
      const constructorSpy = sinon.spy();
      const listenMessagesSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, listenMessagesSpy);
      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.listenMessages(apiKey, unitId, timeout).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          apiKey,
          baseUrl: baseUrl,
        });
        expect(listenMessagesSpy).to.have.been.calledWithExactly(
          apiKey,
          unitId,
          60000
        );
        expect(listenMessagesSpy).to.have.been.calledOnce;
        done();
      });
    });

    it('should call client when apiKey and deviceId provided', done => {
      // Given
      const response = { a: 'response' };
      const constructorSpy = sinon.spy();
      const listenMessagesSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, listenMessagesSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.listenMessages(apiKey, unitId, 60000).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          apiKey,
          baseUrl: baseUrl
        });
        expect(listenMessagesSpy).to.have.been.calledOnce;
        expect(listenMessagesSpy).to.have.been.calledWithExactly(
          apiKey,
          unitId,
          60000
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

});