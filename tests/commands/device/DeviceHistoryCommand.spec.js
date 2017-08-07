const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const DeviceHistoryCommand = require('../../../src/commands/device/DeviceHistoryCommand');
const PageableStream = require('../../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('DeviceHistoryCommand', () => {

  let deviceHistoryCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    args: ['unitIdTest']
  };

  before(() => {
    deviceHistoryCommand = new DeviceHistoryCommand();
    deviceHistoryCommand.barracks = {};
    deviceHistoryCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when unit id is missing', () => {
      // Given
      const program = {};

      // When
      const result = deviceHistoryCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when fromDate format is invalid', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { fromDate: 'notADate'});

      // When
      const result = deviceHistoryCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when fromDate flag is present with no value', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { fromDate: true});

      // When
      const result = deviceHistoryCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when unit id is given', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = deviceHistoryCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return true when unit id and from date are given and fromDate format is valid', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { fromDate: '2014-12-30'});

      // When
      const result = deviceHistoryCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the get device events request fail', done => {
      // Given
      const errorMessage = 'error';
      const program = Object.assign({}, programWithValidOptions);
      const bufferStream = new PageableStream();
      deviceHistoryCommand.barracks = {
        getDeviceEvents: sinon.stub().returns(Promise.resolve(bufferStream))
      };

      // When / Then
      deviceHistoryCommand.execute(program, token).then(result => {
        expect(result).to.be.equals(bufferStream);
        result.onError(err => {
          expect(err).to.be.equals(errorMessage);
          expect(deviceHistoryCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
          expect(deviceHistoryCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.args[0], undefined);
          done();
        });
        bufferStream.fail(errorMessage);
      }).catch(err => {
        done(err);
      });
    });

    it('should return result of getDeviceEvents when request succeed', done => {
      // Given
      const response = [{unitId: 'unit1'}, {unitId: 'unit2'}];
      const program = Object.assign({}, programWithValidOptions);
      const bufferStream = new PageableStream();
      deviceHistoryCommand.barracks = {
        getDeviceEvents: sinon.stub().returns(Promise.resolve(bufferStream))
      };

      // When / Then
      deviceHistoryCommand.execute(program, token).then(result => {
        expect(result).to.be.equals(bufferStream);
        result.onPageReceived(data => {
          expect(data).to.be.equals(response);
          expect(deviceHistoryCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
          expect(deviceHistoryCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.args[0], undefined);
          done();
        });
        bufferStream.write(response);
      }).catch(err => {
        done(err);
      });
    });
  });
});