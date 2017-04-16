const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const TokenClient = require('../../src/clients/TokenClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('TokenClient', () => {

  let tokenClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    tokenClient = new TokenClient();
    tokenClient.httpClient = {};
  });

  describe('#createToken()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const newToken = { name: 'My API token' };
      const error = { message: 'Error !' };
      tokenClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      tokenClient.createToken(token, newToken).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createToken', {
          headers: { 'x-auth-token': token },
          body: newToken
        });
        done();
      });
    });

    it('should return the token created', done => {
      // Given
      const newToken = { name: 'My API token' };
      const newTokenFull = { name: 'My API token', value: 'mnbvcxzasdfghjklpoiuytrewq' };
      const response = { body: newTokenFull };
      tokenClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      tokenClient.createToken(token, newToken).then(result => {
        expect(result).to.be.equals(newTokenFull);
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createToken', {
          headers: { 'x-auth-token': token },
          body: newToken
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getTokens()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const options = {
        headers: {
          'x-auth-token': token
        }
      }
      tokenClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      tokenClient.getTokens(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(tokenClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(tokenClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getTokens',
          options,
          'tokens'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#revokeToken()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const tokenToRevoke = '1234567890987654321234567890';
      const error = { message: 'Error !' };
      tokenClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      tokenClient.revokeToken(token, tokenToRevoke).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('revokeToken', {
          headers: { 'x-auth-token': token },
          pathVariables: { token: tokenToRevoke }
        });
        done();
      });
    });

    it('should return the token revoked', done => {
      // Given
      const tokenToRevoke = '1234567890987654321234567890';
      const revokedToken = {
        id: 'sdfghjhgfdsdfghgfdsdfgh',
        name: 'My API token',
        value: tokenToRevoke,
        revoked: true
      };
      const response = { body: revokedToken };
      tokenClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      tokenClient.revokeToken(token, tokenToRevoke).then(result => {
        expect(result).to.be.equals(revokedToken);
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(tokenClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('revokeToken', {
          headers: { 'x-auth-token': token },
          pathVariables: { token: tokenToRevoke }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});