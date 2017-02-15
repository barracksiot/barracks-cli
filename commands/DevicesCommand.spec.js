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
  const programWithNoOption = {};
  const programWithValidSegment = { segment: 'coucou' };
  const programWithValidFilter = { filter: 'recoucou' };

  before(() => {
    devicesCommand = new DevicesCommand();
    devicesCommand.barracks = {};
    devicesCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when no option given', () => {
      // Given
      const program = programWithNoOption;
      // When
      const result = devicesCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when only segment option given', () => {
      // Given
      const program = programWithValidSegment;
      // When
      const result = devicesCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when only filter option given', () => {
      // Given
      const program = programWithValidFilter;
      // When
      const result = devicesCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when both filter and segment options given', () => {
      // Given
      const program = Object.assign({}, programWithValidFilter, programWithValidSegment);
      // When
      const result = devicesCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute(program)', () => {

    const filterName = programWithValidFilter.filter;
    const query = { eq: { unitId: 'plop' } };
    const filter = {
      name: filterName,
      query
    };

    it('should reject an error when a filter is given and no filter found', done => {
      // Given
      const program = programWithValidFilter;
      const error = 'A pas trouvé le filter';
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getFilterByName = sinon.stub().returns(Promise.reject(error));

      // when / Then
      devicesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledWithExactly(token, filterName);
        done();
      });
    });

    it('should reject an error when a filter is given and get devices request fail', done => {
      // Given
      const program = programWithValidFilter;
      const error = 'request failed';
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getFilterByName = sinon.stub().returns(Promise.resolve(filter));
      devicesCommand.barracks.getFilteredDevices = sinon.stub().returns(Promise.reject(error));

      // when / Then
      devicesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledWithExactly(token, filterName);
        expect(devicesCommand.barracks.getFilteredDevices).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilteredDevices).to.have.been.calledWithExactly(token, query);
        done();
      });
    });

    it('should return a PageableStream object when a filter is given', done => {
      // Given
      const program = programWithValidFilter;
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getFilterByName = sinon.stub().returns(Promise.resolve(filter));
      devicesCommand.barracks.getFilteredDevices = sinon.stub().returns(Promise.resolve(new PageableStream()));

      // when / Then
      devicesCommand.execute(program).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledWithExactly(token, filterName);
        expect(devicesCommand.barracks.getFilteredDevices).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilteredDevices).to.have.been.calledWithExactly(token, query);
        done();
      }).catch(err => {
        done(err);
      });
    });

/*
    it('should return a PageableStream object when services return data', done => {
      // Given
      const program = Object.assign({}, programWithNoOption);
      const channels = [{ name: 'channel1' }, { name: 'channel2' }];
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks = {
        getChannels: sinon.stub().returns(Promise.resolve(channels)),
        getDevices: sinon.stub().returns(Promise.resolve(new PageableStream()))
      };

      // When / Then
      devicesCommand.execute(program).then(result => {
        expect(result).to.be.equals(errorMessage);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getDeviceEvents).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getDeviceEvents).to.have.been.calledWithExactly(token, program.unitId);
        done();
      }).catch(err => {
        done(err);        
      });
    });
  */
  });
});