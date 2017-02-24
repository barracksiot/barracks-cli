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
  const token = '1234567890987654321234567890';
  const programWithValidOptions = { args: [ token ] };

  before(() => {
    revokeTokenCommand = new RevokeTokenCommand();
    revokeTokenCommand.barracks = {};
    revokeTokenCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no argument given', () => {
      // Given
      const program = {};
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when all arguments are valid and present', () => {
      // Given
      const program = programWithValidOptions;
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when more than one argument given', () => {
      // Given
      const program = { args: [ token, 'plop' ] };
      // When
      const result = revokeTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
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
          token
        );
        done();
      });
    });

    it('should return the revoked token when request succeed', done => {
      // Given
      const tokenFull = {
        id: '1234567890987654321',
        name: 'tokenName',
        value: token,
        revoked: true
      };
      const program = Object.assign({}, programWithValidOptions);
      revokeTokenCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      revokeTokenCommand.barracks.revokeToken = sinon.stub().returns(Promise.resolve(tokenFull));

      // When / Then
      revokeTokenCommand.execute(program).then(result => {
        expect(result).to.be.equals(tokenFull);
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(revokeTokenCommand.barracks.revokeToken).to.have.been.calledWithExactly(
          authToken,
          token
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});