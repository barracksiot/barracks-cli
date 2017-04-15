const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const SegmentClient = require('../../src/clients/SegmentClient');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

function buildSegment(segmentId) {
  return {
    id: segmentId,
    name: 'Plop'
  };
}

describe('segmentClient', () => {

  let segmentClient;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {};

  beforeEach(() => {
    segmentClient = new SegmentClient();
    segmentClient.httpClient = {};
    segmentClient.v2Enabled = false;
  });

  describe('#createSegment()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const segment = { name: 'Segment', query: { eq: { unitId: 'value' } } };
      const error = { message: 'Error !' };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      segmentClient.createSegment(token, segment).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createSegment', {
          headers: { 'x-auth-token': token },
          body: segment
        });
        done();
      });
    });

    it('should return the created segment', done => {
      // Given
      const segment = { name: 'Segment', query: { eq: { unitId: 'value' } } };
      const savedSegment = Object.assign({}, segment, { userId: '123456789' });
      const response = { body: savedSegment };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.createSegment(token, segment).then(result => {
        expect(result).to.be.equals(savedSegment);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createSegment', {
          headers: { 'x-auth-token': token },
          body: segment
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#editSegment()', () => {

    const originalSegment = {
      id: '12345678',
      name: 'test segment',
      query: { eq: { unitId: '123456' } }
    };

    it('should return an error message when edit request fails', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'New name' };
      const error = { message: 'Error !' };
      segmentClient.getSegment = sinon.stub().returns(Promise.resolve(originalSegment));
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      segmentClient.editSegment(token, changes).then(result => {
        done('should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(segmentClient.getSegment).to.have.been.calledOnce;
          expect(segmentClient.getSegment).to.have.been.calledWithExactly(token, changes.id);
          expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
          expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('editSegment', {
            headers: { 'x-auth-token': token },
            body: Object.assign({}, originalSegment, changes),
            pathVariables: { id: originalSegment.id }
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should return an error message when the segment does not exist', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'test segment' };
      const error = { message: 'Error !' };
      const excpectedResult = Object.assign({}, originalSegment, changes);
      segmentClient.getSegment = sinon.stub().returns(Promise.reject(error));
      segmentClient.httpClient.sendEndpointRequest = sinon.spy();

      // When / Then
      segmentClient.editSegment(token, changes).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(segmentClient.getSegment).to.have.been.calledOnce;
          expect(segmentClient.getSegment).to.have.been.calledWithExactly(token, changes.id);
          expect(segmentClient.httpClient.sendEndpointRequest).to.not.have.been.called;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should return the edited segment', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'NaaaAAmE' };
      const expectedResult = Object.assign({}, originalSegment, changes);
      const response = { body: expectedResult };
      segmentClient.getSegment = sinon.stub().returns(Promise.resolve(originalSegment));
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.editSegment(token, changes).then(result => {
        expect(result).to.be.equal(expectedResult);
        expect(segmentClient.getSegment).to.have.been.calledOnce;
        expect(segmentClient.getSegment).to.have.been.calledWithExactly(token, changes.id);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('editSegment', {
          headers: { 'x-auth-token': token },
          body: expectedResult,
          pathVariables: { id: originalSegment.id }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getSegmentByName()', () => {

    const otherSegment = { id: 'other', name: 'Other'};

    it('should return an error message when request fails', done => {
      // Given
      const segmentName = 'segment prod';
      const error = 'Error !';
      segmentClient.getSegments = sinon.stub().returns(Promise.reject(error));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return an error if segment does not exist', done => {
      // Given
      const segmentName = 'segment prod';
      const response = {
        active: [
          { id: 'zxcvbnm', name: 'segment' },
          { id: 'zxcvbnm', name: 'other segment' }
        ],
        inactive: [],
        other: otherSegment
      };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('No matching segment.');
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return specified active segment info when request succeed', done => {
      // Given
      const segmentName = 'segment prod';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = {
        active: [ segment, { id: 'zxcvbnm', name: 'other segment' } ],
        other: otherSegment,
        inactive: []
      };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        expect(result).to.be.equals(segment);
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return other segment when name is other when request succeed', done => {
      // Given
      const response = { active: [ { id: 'zxcvbnm', name: 'other segment' } ], inactive: [], other: otherSegment };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, otherSegment.name).then(result => {
        expect(result).to.be.equals(otherSegment);
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return specified segment when inactive', done => {
      // Given
      const segmentName = 'segment';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = {
        inactive: [ segment, { id: 'zxcvbnm', name: 'other segment' } ],
        active: [],
        other: otherSegment
      };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done('err');
      });
    });

    it('should return specified segment when inactive and active segments exist', done => {
      // Given
      const segmentName = 'segment prod';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = {
        inactive: [ segment, { id: 'zxcvbnm', name: 'other segment' } ],
        active: [ { id: 'azdqshsd', name: 'wednesday segment' } ],
        other: otherSegment
      };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error when no inactive or active segment', done => {
      // Given
      const response = {
        inactive: [],
        active: [],
        other: otherSegment
      };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, 'segmentname').then(result => {
        done('Should not have worked');
      }).catch(err => {
        expect(err).to.be.equal('No matching segment.')
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return specified segment when no inactive segment', done => {
      // Given
      const segmentName = 'segment prod';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = { inactive: [], active: [ segment, { id: 'zxcvbnm', name: 'other segment' } ] };
      segmentClient.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegmentByName(token, segmentName).then(result => {
        expect(segmentClient.getSegments).to.have.been.calledOnce;
        expect(segmentClient.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err)
      });
    });
  });

  describe('#getSegment()', () => {

    const existingSegment = {
      id: '123456789',
      name: 'Plop',
      query: {}
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      segmentClient.getSegment(token, existingSegment.id).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getSegment', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            id: existingSegment.id
          }
        });
        done();
      });
    });

    it('should return a segment when request succeed', done => {
      // Given
      const response = { body: existingSegment };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegment(token, existingSegment.id).then(result => {
        expect(result).to.be.equals(existingSegment);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getSegment', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            id: existingSegment.id
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getSegments()', () => {

    it('should return the user segments', done => {
      // Given
      const segments = {
        active: [ buildSegment(1), buildSegment(2) ],
        inactive: [ buildSegment(3), buildSegment(4) ]
      };
      const response = { body: segments };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.getSegments(token).then(result => {
        expect(result).to.be.equals(segments);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error when the request failed', done => {
      // Given
      const errorMessage = "Error";
      const errorResponse = { message: errorMessage };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(errorResponse));

      // When / Then
      segmentClient.getSegments(token).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      });
    });
  });

  describe('#setActiveSegments()', () => {

    const segmentIds = [ '12345', '67890' ];

    it('should return an error message when request fails', done => {
      // Given
      const errorResponse = { message: 'Error !' };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(errorResponse));

      // When / Then
      segmentClient.setActiveSegments(token, segmentIds).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorResponse.message);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('setActiveSegments', {
          headers: { 'x-auth-token': token },
          body: segmentIds
        });
        done();
      });
    });

    it('should return segment ids when request is successful', done => {
      // Given
      const response = { body: segmentIds };
      segmentClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      segmentClient.setActiveSegments(token, segmentIds).then(result => {
        expect(result).to.be.equals(segmentIds);
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(segmentClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('setActiveSegments', {
          headers: { 'x-auth-token': token },
          body: segmentIds
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
