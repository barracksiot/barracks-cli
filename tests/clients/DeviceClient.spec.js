const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const DeviceClient = require('../../src/clients/DeviceClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('DeviceClient', () => {

  let deviceClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    deviceClient = new DeviceClient();
    deviceClient.httpClient = {};
    deviceClient.v2Enabled = false;
  });

  describe('#getDevice()', () => {

    const unitId = 'anUnit';

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      deviceClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      deviceClient.getDevice(token, unitId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(deviceClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(deviceClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getDevice', {
          headers: { 'x-auth-token': token },
          pathVariables: { unitId }
        });
        done();
      });
    });

    it('should return the device information when request succeed', done => {
      // Given
      const device = {
        unitId,
        lastEvent: {},
        lastSeen: 'some date'
      };
      const response = { body: device };
      deviceClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      deviceClient.getDevice(token, unitId).then(result => {
        expect(result).to.deep.equals(device);
        expect(deviceClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(deviceClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getDevice', {
          headers: { 'x-auth-token': token },
          pathVariables: { unitId }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDevices()', () => {

    it('should return a stream object and delegate to the client when v2 is not enabled', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token }
      };

      deviceClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      deviceClient.getDevices(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevicesV1',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return a stream object and delegate to the client when v2 is enabled', done => {
      // Given
      deviceClient.v2Enabled = true;
      const options = {
        headers: { 'x-auth-token': token }
      };

      deviceClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      deviceClient.getDevices(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevicesV2',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDevicesFilteredByQuery()', () => {

    it('should return a stream object and deleguate to the client when query given', done => {
      // Given
      const query = { eq: { unitId: 'plop' } };
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { query: encodeURI(JSON.stringify(query)) }
      };
      deviceClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      deviceClient.getDevicesFilteredByQuery(token, query).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevicesWithQueryV1',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return a stream object and deleguate to the client when query given and v2 is enabled', done => {
      // Given
      deviceClient.v2Enabled = true;
      const query = { eq: { unitId: 'plop' } };
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { query: encodeURI(JSON.stringify(query)) }
      };
      deviceClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      deviceClient.getDevicesFilteredByQuery(token, query).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevicesWithQueryV2',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDevicesBySegment()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      deviceClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      deviceClient.getDevicesBySegment(token, segmentId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getSegmentDevices',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDeviceEvents()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const unitId = 'myUnit';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { unitId }
      };
      deviceClient.httpClient.retrievePagesUntilCondition = sinon.spy();

      // When / Then
      deviceClient.getDeviceEvents(token, unitId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrievePagesUntilCondition).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrievePagesUntilCondition).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDeviceEventsV1',
          options,
          'events',
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return a stream object and deleguate to the client when V2 is enabled', done => {
      // Given
      deviceClient.v2Enabled = true;
      const unitId = 'myUnit';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { unitId }
      };
      deviceClient.httpClient.retrievePagesUntilCondition = sinon.spy();

      // When / Then
      deviceClient.getDeviceEvents(token, unitId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(deviceClient.httpClient.retrievePagesUntilCondition).to.have.been.calledOnce;
        expect(deviceClient.httpClient.retrievePagesUntilCondition).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDeviceEventsV2',
          options,
          'events',
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});