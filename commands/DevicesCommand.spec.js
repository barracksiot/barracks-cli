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
  const segmentName = 'coucou';
  const filterName = 'recoucou';
  const programWithNoOption = {};
  const programWithValidSegment = { segment: segmentName };
  const programWithValidFilter = { filter: filterName };

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

    const query = { eq: { unitId: 'plop' } };
    const filter = {
      name: filterName,
      query
    };
    const segmentId = 'segmentId';
    const segment = {
      id: segmentId,
      name: segmentName,
      query
    };

    it('should reject an error when a filter name is given and no filter found', done => {
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

    it('should reject an error when a filter name is given and get devices request fail', done => {
      // Given
      const program = programWithValidFilter;
      const error = 'request failed';
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getFilterByName = sinon.stub().returns(Promise.resolve(filter));
      devicesCommand.barracks.getDevicesFilteredByQuery = sinon.stub().returns(Promise.reject(error));

      // when / Then
      devicesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledWithExactly(token, filterName);
        expect(devicesCommand.barracks.getDevicesFilteredByQuery).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getDevicesFilteredByQuery).to.have.been.calledWithExactly(token, query);
        done();
      });
    });

    it('should return a PageableStream object when a valid filter name is given', done => {
      // Given
      const program = programWithValidFilter;
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getFilterByName = sinon.stub().returns(Promise.resolve(filter));
      devicesCommand.barracks.getDevicesFilteredByQuery = sinon.stub().returns(Promise.resolve(new PageableStream()));

      // when / Then
      devicesCommand.execute(program).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getFilterByName).to.have.been.calledWithExactly(token, filterName);
        expect(devicesCommand.barracks.getDevicesFilteredByQuery).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getDevicesFilteredByQuery).to.have.been.calledWithExactly(token, query);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error when a segment name is given and no segment found', done => {
      // Given
      const program = programWithValidSegment;
      const error = 'A pas trouvé le segment';
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.reject(error));

      // when / Then
      devicesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segmentName);
        done();
      });
    });

    it('should reject an error when a segment name is given and get devices request fail', done => {
      // Given
      const program = programWithValidSegment;
      const error = 'request failed';
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.resolve(segment));
      devicesCommand.barracks.getSegmentDevices = sinon.stub().returns(Promise.reject(error));

      // when / Then
      devicesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segmentName);
        expect(devicesCommand.barracks.getSegmentDevices).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getSegmentDevices).to.have.been.calledWithExactly(token, segmentId);
        done();
      });
    });

    it('should return a PageableStream object when a valid segment name is given', done => {
      // Given
      const program = programWithValidSegment;
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.resolve(segment));
      devicesCommand.barracks.getSegmentDevices = sinon.stub().returns(Promise.resolve(new PageableStream()));

      // when / Then
      devicesCommand.execute(program).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segmentName);
        expect(devicesCommand.barracks.getSegmentDevices).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getSegmentDevices).to.have.been.calledWithExactly(token, segmentId);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return a PageableStream object when no filter is given', done => {
      // Given
      const program = programWithNoOption;
      devicesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      devicesCommand.barracks.getDevices = sinon.stub().returns(Promise.resolve(new PageableStream()));

      // when / Then
      devicesCommand.execute(program).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(devicesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(devicesCommand.barracks.getDevices).to.have.been.calledOnce;
        expect(devicesCommand.barracks.getDevices).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});