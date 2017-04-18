const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const AccountClient = require('../../src/clients/AccountClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('AccountClient', () => {

  let accountClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    accountClient = new AccountClient();
    accountClient.httpClient = {};
  });

  describe('#authenticate()', () => {

    it('should return an error message when authentication fails', done => {
      // Given
      const username = 'user';
      const password = 'password';
      const error = { message: 'Login failed' };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      accountClient.authenticate(username, password).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/auth/login'
          },
          {
            body: { username, password }
          }
        );
        done();
      });
    });

    it('should return a token when authentication succeed', done => {
      // Given
      const username = 'user';
      const password = 'password';
      const response = { headers: { 'x-auth-token': token } };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      accountClient.authenticate(username, password).then(result => {
        expect(result).to.be.equals(token);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/auth/login'
          },
          {
            body: { username, password }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getAccount()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      accountClient.getAccount(token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'GET',
            path: '/api/auth/me'
          },
          {
            headers: { 'x-auth-token': token }
          }
        );
        done();
      });
    });

    it('should return a token when authentication succeed', done => {
      // Given
      const account = { apiKey: 'qwertyuiop', username: 'coucou' };
      const response = { body: account };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      accountClient.getAccount(token).then(result => {
        expect(result).to.be.equals(account);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'GET',
            path: '/api/auth/me'
          },
          {
            headers: { 'x-auth-token': token }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#setGoogleAnalyticsId()', () => {

    const analyticsId = 'UA-12345678-1';

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      accountClient.setGoogleAnalyticsTrackingId(token, analyticsId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'PUT',
            path: '/api/auth/me/gaTrackingId'
          },
          {
            headers: { 'x-auth-token': token },
            body: { value: analyticsId }
          }
        );
        done();
      });
    });

    it('should return the server response when request success', done => {
      // Given
      const account = { apiKey: 'qwertyuiop', username: 'coucou', gaTrackingId: analyticsId };
      const response = { body: account };
      accountClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      accountClient.setGoogleAnalyticsTrackingId(token, analyticsId).then(result => {
        expect(result).to.be.equals(account);
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(accountClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'PUT',
            path: '/api/auth/me/gaTrackingId'
          },
          {
            headers: { 'x-auth-token': token },
            body: { value: analyticsId }
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});