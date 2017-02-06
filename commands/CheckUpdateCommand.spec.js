const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const CheckUpdateCommand = require('./CheckUpdateCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CheckUpdateCommand', () => {

  let checkUpdateCommand;
  const token = '123456WS';
  const unitId = 'testCLI_1';
  const versionId = '0.1';
  const apiKey = '1234567890poiuytrewq';
  const programWithValidArgs = {
    args: [
      '{ "unitId":"' + unitId + '", "versionId":"' + versionId + '"}',
      apiKey
    ]
  };

  describe('#validateCommand(program)', () => {

    before(() => {
      checkUpdateCommand = new CheckUpdateCommand();
      checkUpdateCommand.barracks = {};
      checkUpdateCommand.userConfiguration = {};
    });
  
    it('should return true when device given', () => {
      // Given
      const program = { args: ['{ "unitId":"testCLI_1", "versionId":"0.1"}'] };

      // When
      const result = checkUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when no param given', () => {
      // Given
      const program = { args: [] };

      // When
      const result = checkUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute()', () => {

    before(() => {
      checkUpdateCommand = new CheckUpdateCommand();
      checkUpdateCommand.barracks = {};
      checkUpdateCommand.userConfiguration = {};
    });
  
    it('should call client to check update', done => {
      // Given
      const program = programWithValidArgs;
      const account = { apiKey };
      const response = 'cool';
      checkUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      checkUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        checkUpdate: sinon.stub().returns(Promise.resolve(response))
      };

      // When / Then
      checkUpdateCommand.execute(program).then(result => {
        expect(result).to.equal(response);
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(checkUpdateCommand.barracks.checkUpdate).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.checkUpdate).to.have.been.calledWithExactly(
          apiKey,
          { unitId, versionId }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
