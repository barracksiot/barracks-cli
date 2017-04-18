const mockStdin = require('mock-stdin');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const LogoutCommand = require('../../src/commands/LogoutCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('LogoutCommand', () => {

  let logoutCommand;
  let stdin;

  const apiToken = 'qazxswedcvfrtgbnhyujm,kiol./;p';

  describe('#execute()', () => {

    beforeEach(() => {
      logoutCommand = new LogoutCommand();
      logoutCommand.barracks = {};
      logoutCommand.userConfiguration = {};
    });

    it('should reject an error when getAuthenticationToken fails', (done) => {
      // Const
      const error = 'anError';
      logoutCommand.getAuthenticationToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      logoutCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      });
    });

    it('should reject an error when revokeToken fails', (done) => {
      // Const
      const error = 'anError';
      logoutCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken));
      logoutCommand.barracks.revokeToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      logoutCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledWithExactly(apiToken, apiToken);
        done();
      });
    });

    it('should reject an error when saveAuthenticationToken fails', (done) => {
      // Const
      const error = 'anError';
      logoutCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken));
      logoutCommand.barracks.revokeToken = sinon.stub().returns(Promise.resolve({ value: apiToken }));
      logoutCommand.saveAuthenticationToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      logoutCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledWithExactly(apiToken, apiToken);
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledWithExactly('');
        done();
      });
    });
    
    it('should send an empty token to save to UserConfig', (done) => {
      // Given
      logoutCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken));
      logoutCommand.barracks.revokeToken = sinon.stub().returns(Promise.resolve({ value: apiToken }));
      logoutCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(''));

      // When / Then
      logoutCommand.execute().then(result => {
        expect(result).to.be.equals('Logout successful');
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledOnce;
        expect(logoutCommand.barracks.revokeToken).to.have.been.calledWithExactly(apiToken, apiToken);
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledWithExactly('');
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});