const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const RevokeTokenCommand = require('./RevokeTokenCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('RevokeTokenCommand', () => {

  let revokeTokenCommand;

  const authToken = '123456WS';
  const tokenId = '1234567890987654321234567890';
  const programWithValidOptions = {
    'token-id': tokenId
  };

  before(() => {
    revokeTokenCommand = new RevokeTokenCommand();
    revokeTokenCommand.barracks = {};
    revokeTokenCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when no value given for token id', () => {
      // Given
      const program = { 'token-id': true };
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute()', () => {

    it('should reject an error if request fail', done => {
      // Given
      const error = 'Request failed';
      const program = Object.assign({}, programWithValidOptions);
      revokeTokenCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      revokeTokenCommand.barracks.revokeToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      revokeTokenCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledWithExactly(
          authToken,
          tokenId
        );
        done();
      });
    });

    it('should return the revoked token when request succeed', done => {
      // Given
      const token = {
        id: tokenId,
        name: 'tokenName',
        value: 'qwertyuioplkjhgfdsazxcvbnm',
        revoked: true
      };
      const program = Object.assign({}, programWithValidOptions);
      revokeTokenCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      revokeTokenCommand.barracks.revokeToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      revokeTokenCommand.execute(program).then(result => {
        expect(result).to.be.equals(token);
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledWithExactly(
          authToken,
          tokenId
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});