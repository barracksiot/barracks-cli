const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const DeviceCommand = require('../../../src/commands/device/DeviceCommand');
const PageableStream = require('../../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('DeviceCommand', () => {

  let deviceCommand;
  const token = 'i8uhkj.token.65ryft';
  const unitId = 'myCoolestUnit';
  const programWithValidOptions = {
    args: [ unitId ]
  };

  before(() => {
    deviceCommand = new DeviceCommand();
    deviceCommand.barracks = {};
    deviceCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no argument given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = deviceCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when more than one argument given', () => {
      // Given
      const program = { args: ['aUnit', 'anotherUnit'] };
      // When
      const result = deviceCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when one argument given', () => {
      // Given
      const program = programWithValidOptions;
      // When
      const result = deviceCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the get device events request fail', done => {
      // Given
      const errorMessage = 'error';
      const program = Object.assign({}, programWithValidOptions);
      deviceCommand.barracks.getDevice = sinon.stub().returns(Promise.reject(errorMessage));

      // When / Then
      deviceCommand.execute(program, token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(deviceCommand.barracks.getDevice).to.have.been.calledOnce;
        expect(deviceCommand.barracks.getDevice).to.have.been.calledWithExactly(token, unitId);
        done();
      });
    });

    it('should return result of getDevice when request succeed', done => {
      // Given
      const response = {
        unitId,
        lastEvent: {},
        lastSeen: 'sometime before now'
      };
      const program = Object.assign({}, programWithValidOptions);
      deviceCommand.barracks.getDevice = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      deviceCommand.execute(program, token).then(result => {
        expect(result).to.deep.equals(response);
        expect(deviceCommand.barracks.getDevice).to.have.been.calledOnce;
        expect(deviceCommand.barracks.getDevice).to.have.been.calledWithExactly(token, unitId);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});