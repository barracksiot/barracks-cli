const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const HookClient = require('../../src/clients/HookClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

function buildSegment(segmentId) {
  return {
    id: segmentId,
    name: 'Plop'
  };
}

describe('hookClient', () => {

  let hookClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    hookClient = new HookClient();
    hookClient.httpClient = {};
  });

  describe('#createHook()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const hook = { type: 'web', name: 'Hook', url: 'https://localhost/hookName' };
      const error = { message: 'Error !' };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.createHook(token, hook).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/dispatcher/hooks'
          },
          {
            headers: { 'x-auth-token': token },
            body: hook
          }
        );
        done();
      });
    });

    it('should return the created hook', done => {
      // Given
      const hook = { type: 'web', name: 'Hook', url: 'https://localhost/hookName' };
      const savedHook = Object.assign({}, hook, { userId: '123456789' });
      const response = { body: savedHook };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hookClient.createHook(token, hook).then(result => {
        expect(result).to.be.equals(savedHook);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/dispatcher/hooks'
          },
          {
            headers: { 'x-auth-token': token },
            body: hook
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#deleteHook()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const name = 'aHook';
      const error = { message: 'Error !' };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.deleteHook(token, name).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'DELETE',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { hook: name }
          }
        );
        done();
      });
    });

    it('should return nothing when hook is deleted', done => {
      // Given
      const name = 'aHook';
      const response = { body: undefined };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hookClient.deleteHook(token, name).then(result => {
        expect(result).to.be.equals(undefined);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'DELETE',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { hook: name }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
