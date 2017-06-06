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

function getProxifiedBarracks(constructorSpy, connectSpy, subscribeSpy, endSpy) {
  return proxyquire(messagingSDKProxyPath, {
    'barracks-messenger-sdk-betatest':  {
      BarracksMessenger: function Constructor(options) {
        constructorSpy(options);
        this.connect = connectSpy;
        this.subscribe = subscribeSpy;
        this.end = endSpy;
      }
    }
  });
}

describe('BarracksMessagingSDKProxy', () => {

  const baseUrl = 'https://app.barracks.io';
  const mqttEndpoint = 'mqtt://app.barracks.io';
  const apiKey = 'myApiKey';
  const unitId = 'unitId';
  const timeout = 500;

  describe('#listenMessages()', () => {

    const message = 'Bonjour !';

    it('should reject an error if client fails', done => {
      // Given
      const error = 'a dramatic error';
      const constructorSpy = sinon.spy();
      const subscribeSpy = sinon.spy();
      const connectSpy = sinon.spy(this.connect);

      const endSpy = sinon.spy();
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, connectSpy, subscribeSpy, endSpy);
      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;

      // When / Then
      barracks.listenMessages(apiKey, unitId, timeout).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          apiKey,
          baseUrl,
          mqttEndpoint,
          unitId
        });
        expect(connectSpy).to.have.been.calledOnce;
        done();
      });
    });

    it('should call client when apiKey and deviceId provided', done => {
      // Given
      const response = { a: 'response' };
      const constructorSpy = sinon.spy();
      const connectSpy = sinon.spy();
      const subscribeSpy = sinon.spy();
      const endSpy = sinon.spy();
      const ProxifiedBarracks = getProxifiedBarracks(constructorSpy, connectSpy, subscribeSpy, endSpy);

      const barracks = new ProxifiedBarracks();
      barracks.baseUrl = baseUrl;
      barracks.mqttEndpoint = mqttEndpoint;

      // When / Then
      barracks.listenMessages(apiKey, unitId, timeout).then(result => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          apiKey,
          baseUrl,
          mqttEndpoint,
          unitId
        });
        expect(connectSpy).to.have.been.calledOnce;
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

});