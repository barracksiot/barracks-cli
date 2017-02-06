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
  const downloadPath = 'path/to/download/';
  const programWithValidArgs = {
    args: ['{ "unitId":"' + unitId + '", "versionId":"' + versionId + '"}'],
    download: downloadPath
  };

  describe('#validateCommand(program)', () => {

    before(() => {
      checkUpdateCommand = new CheckUpdateCommand();
      checkUpdateCommand.barracks = {};
      checkUpdateCommand.userConfiguration = {};
    });
  
    it('should return true when device and download path given', () => {
      // Given
      const program = programWithValidArgs;
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when device and no option given', () => {
      // Given
      const program = {args: ['{ "unitId":"' + unitId + '", "versionId":"' + versionId + '"}']};
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when device given and download option without path', () => {
      // Given
      const program = Object.assign({}, programWithValidArgs, { download: true });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when no device given with download option', () => {
      // Given
      const program = Object.assign({}, programWithValidArgs, { args: [] });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when no device given with no option', () => {
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
      const program = Object.assign({}, programWithValidArgs, { download: undefined });
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

    it('should call client to check and download update when download option given', done => {
      // Given
      const program = programWithValidArgs;
      const account = { apiKey };
      const response = 'cool';
      checkUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      checkUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        checkUpdateAndDownload: sinon.stub().returns(Promise.resolve(response))
      };

      // When / Then
      checkUpdateCommand.execute(program).then(result => {
        expect(result).to.equal(response);
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(checkUpdateCommand.barracks.checkUpdateAndDownload).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.checkUpdateAndDownload).to.have.been.calledWithExactly(
          apiKey,
          { unitId, versionId },
          downloadPath
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
