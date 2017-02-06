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

    it('should return true when the device and apiKey are given', () => {
      // Given
      const program = programWithValidArgs;

      // When
      const result = checkUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  
    it('should return false when one param given', () => {
      // Given
      const program = { args: ['{ "unitId":"testCLI_1", "versionId":"0.1"}'] };

      // When
      const result = checkUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
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
      const response = 'cool';
      checkUpdateCommand.barracks.checkUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      checkUpdateCommand.execute(program).then(result => {
        expect(result).to.equal(response);
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
