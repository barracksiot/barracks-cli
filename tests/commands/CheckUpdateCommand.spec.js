const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const CheckUpdateCommand = require('../../src/commands/CheckUpdateCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CheckUpdateCommand', () => {

  let checkUpdateCommand;
  const token = '123456WS';
  const unitId = 'testCLI_1';
  const versionId = '0.1';
  const customClientData = { key1: 'value', key2: 4 };
  const apiKey = '1234567890poiuytrewq';
  const downloadPath = 'path/to/download/';
  const validProgram = {
    unitId, versionId
  };
  const validProgramWithCustomData = {
    unitId, versionId, customClientData: JSON.stringify(customClientData)
  };

  describe('#validateCommand(program)', () => {

    before(() => {
      checkUpdateCommand = new CheckUpdateCommand();
      checkUpdateCommand.barracks = {};
      checkUpdateCommand.userConfiguration = {};
    });

    it('should return true when unitId and versionId given', () => {
      // Given
      const program = validProgram;
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when unitId, versionId and customClientData given', () => {
      // Given
      const program = validProgramWithCustomData;
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when unitId, versionId, customClientData and download path given', () => {
      // Given
      const program = Object.assign({}, validProgramWithCustomData, { download: downloadPath });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when unitId, versionId and download path given', () => {
      // Given
      const program = Object.assign({}, validProgram, { download: downloadPath });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when download is given without value', () => {
      // Given
      const program = Object.assign({}, validProgram, { download: true });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when unitId is missing', () => {
      // Given
      const program = { versionId };
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when versionId is missing', () => {
      // Given
      const program = { unitId };
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when unitId has no value', () => {
      // Given
      const program = Object.assign({}, validProgram, { unitId: true });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when versionId  has no value', () => {
      // Given
      const program = Object.assign({}, validProgram, { versionId: true });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
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
      const program = validProgram;
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

    it('should call client to check update with custom data', done => {
      // Given
      const program = validProgramWithCustomData;
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
          { unitId, versionId, customClientData }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call client to check and download update when download option given', done => {
      // Given
      const program = Object.assign({}, validProgram, { download: downloadPath });
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
