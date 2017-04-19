const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const CheckUpdateCommand = require('../../src/commands/CheckUpdateV2Command');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CheckUpdateV2Command', () => {

  let checkUpdateCommand;
  const token = '123456WS';
  const unitId = 'testCLI_1';
  const packages = [{ reference: 'plop', version: '0.0.1' }];
  const customClientData = { key1: 'value', key2: 4 };
  const apiKey = '1234567890poiuytrewq';
  const downloadPath = 'path/to/download/';
  const validProgram = {
    unitId, packages: JSON.stringify(packages)
  };
  const validProgramWithCustomData = Object.assign(
    {}, 
    validProgram, 
    { customClientData: JSON.stringify(customClientData) }
  );

  describe('#validateCommand(program)', () => {

    before(() => {
      checkUpdateCommand = new CheckUpdateCommand();
      checkUpdateCommand.barracks = {};
      checkUpdateCommand.userConfiguration = {};
    });

    it('should return true when unitId and packages are given', () => {
      // Given
      const program = validProgram;
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when unitId, packages and customClientData are given', () => {
      // Given
      const program = validProgramWithCustomData;
      // When
      const result = checkUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when unitId is missing', () => {
      // Given
      const program = Object.assign({}, validProgram, { unitId: undefined });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when packages is missing', () => {
      // Given
      const program = Object.assign({}, validProgram, { packages: undefined });
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

    it('should return false when packages has no value', () => {
      // Given
      const program = Object.assign({}, validProgram, { packages: true });
      // When
      const result = checkUpdateCommand.validateCommand(program);
      console.log(result);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when packages is not a JSON array', () => {
      // Given
      const program = Object.assign({}, validProgram, { packages: '{}' });
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
        resolveDevicePackages: sinon.stub().returns(Promise.resolve(response))
      };

      // When / Then
      checkUpdateCommand.execute(program).then(result => {
        expect(result).to.equal(response);
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(checkUpdateCommand.barracks.resolveDevicePackages).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.resolveDevicePackages).to.have.been.calledWithExactly(
          apiKey,
          { unitId, packages }
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
        resolveDevicePackages: sinon.stub().returns(Promise.resolve(response))
      };

      // When / Then
      checkUpdateCommand.execute(program).then(result => {
        expect(result).to.equal(response);
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(checkUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(checkUpdateCommand.barracks.resolveDevicePackages).to.have.been.calledOnce;
        expect(checkUpdateCommand.barracks.resolveDevicePackages).to.have.been.calledWithExactly(
          apiKey,
          { unitId, packages, customClientData }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

  });
});
