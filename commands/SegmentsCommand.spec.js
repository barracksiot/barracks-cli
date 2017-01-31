const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const SegmentsCommand = require('./SegmentsCommand');
const PageableStream = require('../clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

function buildSegment(segmentId) {
  return {
    id: segmentId,
    name: 'Plop'
  };
}

describe('segmentsCommand', () => {

  let segmentsCommand;
  const token = 'i8uhkj.token.65ryft';

  before(() => {
    segmentsCommand = new SegmentsCommand();
    segmentsCommand.barracks = {};
    segmentsCommand.userConfiguration = {};
  });

  describe('#execute(program)', () => {

    it('should return an error when the request fail', done => {
      // Given
      const errorMessage = 'error';
      segmentsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      segmentsCommand.barracks = {
        getSegments: sinon.stub().returns(Promise.reject(errorMessage))
      };

      // When / Then
      segmentsCommand.execute({}).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(segmentsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(segmentsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(segmentsCommand.barracks.getSegments).to.have.been.calledOnce;
        expect(segmentsCommand.barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return the segments when the request was successful', done => {
      // Given
      const segments = {
        active: [buildSegment(1), buildSegment(2)],
        inactive: [buildSegment(3), buildSegment(4)]
      };
      segmentsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      segmentsCommand.barracks = {
        getSegments: sinon.stub().returns(Promise.resolve(segments))
      };

      // When / Then
      segmentsCommand.execute({}).then(result => {
        expect(result).to.be.equals(segments);
        expect(segmentsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(segmentsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(segmentsCommand.barracks.getSegments).to.have.been.calledOnce;
        expect(segmentsCommand.barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

  });
});