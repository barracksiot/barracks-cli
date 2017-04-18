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

  describe('#execute()', () => {

    before(() => {
      logoutCommand = new LogoutCommand();
      logoutCommand.barracks = {};
      logoutCommand.userConfiguration = {};
    });

    it('should send an empty token to save to UserConfig', (done) => {
      // Given
      logoutCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(''));

      // When / Then
      logoutCommand.execute().then(result => {
        expect(result).to.be.equals('Logout successful');
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(logoutCommand.saveAuthenticationToken).to.have.been.calledWithExactly('');
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});