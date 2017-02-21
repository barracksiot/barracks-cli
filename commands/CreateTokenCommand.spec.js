const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CreateTokenCommand = require('./CreateTokenCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateTokenCommand', () => {

  let createTokenCommand;

  const authToken = '123456WS';
  const tokenName = 'My API Token';
  const programWithValidOptions = {
    name: tokenName
  };

  before(() => {
    createTokenCommand = new CreateTokenCommand();
    createTokenCommand.barracks = {};
    createTokenCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = createTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when no value given for name', () => {
      // Given
      const program = { name: true };
      // When
      const result = createTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      // When
      const result = createTokenCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute()', () => {

    it('should reject an error if request fail', done => {
      // Given
      const error = 'Request failed';
      const program = Object.assign({}, programWithValidOptions);
      createTokenCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      createTokenCommand.barracks.createToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      createTokenCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(createTokenCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createTokenCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createTokenCommand.barracks.createToken).to.have.been.calledOnce;
        expect(createTokenCommand.barracks.createToken).to.have.been.calledWithExactly(
          authToken,
          { name: tokenName }
        );
        done();
      });
    });

    it('should return the created token when request succeed', done => {
      // Given
      const token = {
        name: tokenName,
        value: 'qwertyuioplkjhgfdsazxcvbnm'
      };
      const program = Object.assign({}, programWithValidOptions);
      createTokenCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      createTokenCommand.barracks.createToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      createTokenCommand.execute(program).then(result => {
        expect(result).to.be.equals(token);
        expect(createTokenCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createTokenCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createTokenCommand.barracks.createToken).to.have.been.calledOnce;
        expect(createTokenCommand.barracks.createToken).to.have.been.calledWithExactly(
          authToken,
          { name: tokenName }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});