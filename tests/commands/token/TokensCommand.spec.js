const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const TokensCommand = require('../../../src/commands/token/TokensCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('TokensCommand', () => {

  let tokensCommand;

  const program = {};
  const authToken = '123456WS';

  before(() => {
    tokensCommand = new TokensCommand();
    tokensCommand.barracks = {};
    tokensCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when no option given', () => {
      // When
      const result = tokensCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute()', () => {

    it('should reject an error if request fail', done => {
      // Given
      const error = 'Request failed';
      tokensCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      tokensCommand.barracks.getTokens = sinon.stub().returns(Promise.reject(error));

      // When / Then
      tokensCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(tokensCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(tokensCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(tokensCommand.barracks.getTokens).to.have.been.calledOnce;
        expect(tokensCommand.barracks.getTokens).to.have.been.calledWithExactly(authToken);
        done();
      });
    });

    it('should return the request response', done => {
      // Given
      const tokens = [
        { id: '1234', name: 'aname', value: 'qwertyuiop', revoked: false },
        { id: '5678', name: '2name', value: 'asdfghjkl', revoked: false },
        { id: '9012', name: '3name', value: 'zxcvbnm', revoked: true },
      ];
      tokensCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(authToken));
      tokensCommand.barracks.getTokens = sinon.stub().returns(Promise.resolve(tokens));

      // When / Then
      tokensCommand.execute(program).then(result => {
        expect(result).to.be.equals(tokens);
        expect(tokensCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(tokensCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(tokensCommand.barracks.getTokens).to.have.been.calledOnce;
        expect(tokensCommand.barracks.getTokens).to.have.been.calledWithExactly(authToken);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});