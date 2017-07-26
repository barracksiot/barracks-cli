const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const HookClient = require('../../src/clients/HookClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('hookClient', () => {

  let hookClient;
  const token = 'i8uhkj.token.65ryft';
  const hookName = 'myHook';
  const hook = { type: 'web', name: hookName, url: 'https://mysite.io/callDaHook' };

  beforeEach(() => {
    hookClient = new HookClient();
    hookClient.httpClient = {};
  });

  describe('#createHook()', () => {

    it('should return an error message when request fails', done => {
      // Given
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

    it('should return an error message when request fails with statusCode 400', done => {
      // Given
      const error = { message: 'Error !', statusCode: 400 };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.createHook(token, hook).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('A hook with this name already exists.');
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

  describe('#getHook()', () => {

    it('should return an error when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.getHook(token, hookName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'GET',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: {
              hook: hookName
            }
          }
        );
        done();
      });
    });
   
    it('should return specified hook when request succeeds', done => {
      // Given
      const response = { body: hook };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hookClient.getHook(token, hookName).then(result => {
        expect(result).to.be.equals(hook);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'GET',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: {
              hook: hookName
            }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getHooks()', () => {

    it('should forward to the client with correct headers', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token },
      }
      hookClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      hookClient.getHooks(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(hookClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(hookClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          {
            method: 'GET',
            path: '/api/dispatcher/hooks'
          },
          options,
          'hooks'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#updateHook()', () => {

    const newHook = Object.assign({}, hook, {
      name: 'aNewName',
      url: 'https://a.new.site/callDaHook'
    });

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.updateHook(token, hookName, newHook).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'PUT',
            path: '/api/dispatcher/hooks/:hook'
          }, {
            headers: { 'x-auth-token': token },
            pathVariables: { hook : hookName},
            body: newHook
          }
        );
        done();
      });
    });

    it('should return the updated hook', done => {
      // Given
      const response = { body: newHook };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hookClient.updateHook(token, hookName, newHook).then(result => {
        expect(result).to.be.equals(newHook);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'PUT',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { hook: hookName},
            body: newHook
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
      const error = { message: 'Error !' };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.deleteHook(token, hookName).then(result => {
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
            pathVariables: { hook: hookName }
          }
        );
        done();
      });
    });

    it('should return an error message when request fails with a 404', done => {
      // Given
      const error = { message: 'Error !', statusCode: 404 };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      hookClient.deleteHook(token, hookName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('The hook you are trying to remove does not exist.');
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'DELETE',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { hook: hookName }
          }
        );
        done();
      });
    });

    it('should return nothing when hook is deleted', done => {
      // Given
      const response = { body: undefined };
      hookClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hookClient.deleteHook(token, hookName).then(result => {
        expect(result).to.be.equals(undefined);
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(hookClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'DELETE',
            path: '/api/dispatcher/hooks/:hook'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { hook: hookName }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
