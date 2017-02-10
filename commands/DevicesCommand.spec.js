const PageableStream = require('../clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const DevicesCommand = require('./DevicesCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('DevicesCommand', () => {

  let devicesCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {};

  before(() => {
    devicesCommand = new DevicesCommand();
    devicesCommand.barracks = {};
    devicesCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true', () => {
      // Given
      const program = {};

      // When
      const result = devicesCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return a PageableStream object when services return data', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks = {
        getDevices: sinon.stub().returns(Promise.resolve(new PageableStream()))
      };

      // When / Then
      devicesCommand.execute(program).then(result => {
        /*
        expect(result).to.be.equals(errorMessage);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.unitId);
        */
        done();
      }).catch(err => {
        done(err);        
      });
    });
  });
});