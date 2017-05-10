const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const RemoveGoogleClientSecretCommand = require('../../../src/commands/integration/RemoveGoogleClientSecretCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);


describe('RemoveGoogleClientSecretCommand', () => {

  let removeGoogleClientSecretCommand;
  const token = '198z3e2d825e';

  describe('#execute()', () => {

    before(() => {
      removeGoogleClientSecretCommand = new RemoveGoogleClientSecretCommand();
      removeGoogleClientSecretCommand.barracks = {};
      removeGoogleClientSecretCommand.userConfiguration = {};
    });

    it('should forward to client', done => {
      // Given
      const response = 'it works';
      removeGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      removeGoogleClientSecretCommand.barracks.removeGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      removeGoogleClientSecretCommand.execute().then(result => {
        expect(result).to.be.equals(response);
        expect(removeGoogleClientSecretCommand.barracks.removeGoogleClientSecret).to.have.been.calledOnce;
        expect(removeGoogleClientSecretCommand.barracks.removeGoogleClientSecret).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});