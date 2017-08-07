const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const AuthenticatedBarracksCommand = require('../../src/commands/AuthenticatedBarracksCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('AuthenticatedBarracksCommand', () => {

  let authenticatedBarracksCommand;

  describe('#getResult', () => {

    const program = { option: 'value' };

    beforeEach(() => {
      authenticatedBarracksCommand = new AuthenticatedBarracksCommand();
    });

    it('Should reject an error when authentication fail', done => {
      // Given
      const authenticationError = { the: 'error' };
      authenticatedBarracksCommand.getAuthenticationToken = sinon.stub().returns(Promise.reject(authenticationError));

      // When / Then
      authenticatedBarracksCommand.getResult(program).then(() => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(authenticationError);
        expect(authenticatedBarracksCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(authenticatedBarracksCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      });
    });

    it('Should return execute result when authentication succeed', done => {
      // Given
      const token = 'asdgvbjkml';
      const executeResponse = { the: 'response' };
      authenticatedBarracksCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      authenticatedBarracksCommand.execute = sinon.stub().returns(executeResponse);

      // When / Then
      authenticatedBarracksCommand.getResult(program).then(result => {
        expect(result).to.be.equals(executeResponse);
        expect(authenticatedBarracksCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(authenticatedBarracksCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(authenticatedBarracksCommand.execute).to.have.been.calledOnce;
        expect(authenticatedBarracksCommand.execute).to.have.been.calledWithExactly(program, token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});