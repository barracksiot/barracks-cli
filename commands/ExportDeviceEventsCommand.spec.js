const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const ExportDeviceEventsCommand = require('./ExportDeviceEventsCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ExportDeviceEventsCommand', () => {

  let exportDeviceEventsCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    unitId: 'unitIdTest'
  };

  before(() => {
    exportDeviceEventsCommand = new ExportDeviceEventsCommand();
    exportDeviceEventsCommand.barracks = {};
    exportDeviceEventsCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when unit id is missing', () => {
      // Given
      const program = {};

      // When
      const result = exportDeviceEventsCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when unit id is given', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = exportDeviceEventsCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the get device events request fail', (done) => {
      // Given
      const errorMessage = 'error';
      const program = Object.assign({}, programWithValidOptions);
      exportDeviceEventsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      exportDeviceEventsCommand.barracks = {
        getDeviceEvents: sinon.stub().returns(Promise.reject(errorMessage))
      };

      // When / Then
      exportDeviceEventsCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(exportDeviceEventsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(exportDeviceEventsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(exportDeviceEventsCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
        expect(exportDeviceEventsCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.unitId);
        done();
      });
    });

    it('should return result of getDeviceEvents when request succeed', (done) => {
      // Given
      const response = [{unitId: 'unit1'}, {unitId: 'unit2'}];
      const program = Object.assign({}, programWithValidOptions);
      exportDeviceEventsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      exportDeviceEventsCommand.barracks = {
        getDeviceEvents: sinon.stub().returns(Promise.resolve(response))
      };

      // When / Then
      exportDeviceEventsCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(exportDeviceEventsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(exportDeviceEventsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(exportDeviceEventsCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
        expect(exportDeviceEventsCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.unitId);
        done();
      }).catch(err => {
        console.log(err);
        done('Should have succeeded');
      });
    });
  });
});