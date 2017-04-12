const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const SetActiveSegmentsCommand = require('../../../src/commands/segment/SetActiveSegmentsCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SetActiveSegmentsCommand', () => {

  let command;
  const token = 'i8uhkj.token.65ryft';
  const programWithSegmentIds = { args: [ '123456789', '098765432' ] };

  beforeEach(() => {
    command = new SetActiveSegmentsCommand();
    command.barracks = {};
    command.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no args', () => {
      // Given
      const program = { args: [] };

      // When
      const result = command.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when args', () => {
      // Given
      const program = { args: [ '12345', '67890' ] };

      // When
      const result = command.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return true when no args and --empty', () => {
      // Given
      const program = { args: [], empty: true };

      // When
      const result = command.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when args and --empty', () => {
      // Given
      const program = { args: [ '12345' ], empty: true };

      // When
      const result = command.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

  });

  describe('#execute(program)', () => {

    it('should return an error when the request fail', done => {
      // Given
      const errorMessage = 'error';
      command.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      command.barracks = {
        setActiveSegments: sinon.stub().returns(Promise.reject(errorMessage))
      };

      // When / Then
      command.execute(programWithSegmentIds).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(command.getAuthenticationToken).to.have.been.calledOnce;
        expect(command.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(command.barracks.setActiveSegments).to.have.been.calledOnce;
        expect(command.barracks.setActiveSegments).to.have.been.calledWithExactly(token, programWithSegmentIds.args);
        done();
      });
    });

    it('should resolve when the request is successful', done => {
      // Given
      command.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      command.barracks = {
        setActiveSegments: sinon.stub().returns(Promise.resolve(programWithSegmentIds.args))
      };

      // When / Then
      command.execute(programWithSegmentIds).then(result => {
        expect(result).to.be.equals(programWithSegmentIds.args);
        expect(command.getAuthenticationToken).to.have.been.calledOnce;
        expect(command.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(command.barracks.setActiveSegments).to.have.been.calledOnce;
        expect(command.barracks.setActiveSegments).to.have.been.calledWithExactly(token, programWithSegmentIds.args);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should send no ids when option --empty is used', done => {
      // Given
      const program = { empty: true, args: [] };
      command.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      command.barracks = {
        setActiveSegments: sinon.stub().returns(Promise.resolve(program.args))
      };

      // When / Then
      command.execute(program).then(result => {
        expect(result).to.be.equals(program.args);
        expect(command.getAuthenticationToken).to.have.been.calledOnce;
        expect(command.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(command.barracks.setActiveSegments).to.have.been.calledOnce;
        expect(command.barracks.setActiveSegments).to.have.been.calledWithExactly(token, program.args);
        done();
      }).catch(err => {
        done(err);
      });
    });

  });
});
