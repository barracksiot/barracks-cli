const PageableStream = require('../clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const SetGoogleAnalyticsTrackingIdCommand = require('./SetGoogleAnalyticsTrackingIdCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SetGoogleAnalyticsTrackingIdCommand', () => {

  let setGoogleAnalyticsTrackingIdCommand;
  const token = 'i8uhkj.token.65ryft';
  const analyticsId = 'UA-12345678-1';
  const validProgram = { args: [ analyticsId ] };

  before(() => {
    setGoogleAnalyticsTrackingIdCommand = new SetGoogleAnalyticsTrackingIdCommand();
    setGoogleAnalyticsTrackingIdCommand.barracks = {};
    setGoogleAnalyticsTrackingIdCommand.userConfiguration = {};
  });

  describe('#configureCommand(program)', () => {

    it('should set the ga-tracking-id as the only argument', () => {
      // Given
      const spyArguments = sinon.spy();
      const args = [];
      const arguments = (arg) => {
        spyArguments(arg);
        args.push(arg);
        return program;
      };
      const program = { arguments, args };

      // When
      const result = setGoogleAnalyticsTrackingIdCommand.configureCommand(program);

      // Then
      expect(result).to.be.equal(program);
      expect(args).to.have.length(1);
      expect(args[0]).to.be.equals('<ga-tracking-id>');
      expect(spyArguments).to.have.been.calledOnce;
      expect(spyArguments).to.have.been.calledWithExactly('<ga-tracking-id>');
    });

  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = setGoogleAnalyticsTrackingIdCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false more than one arg given', () => {
      // Given
      const program = { args: [ 'one', 'two' ] };
      // When
      const result = setGoogleAnalyticsTrackingIdCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when tracking id given as argument', () => {
      // Given
      const program = validProgram;
      // When
      const result = setGoogleAnalyticsTrackingIdCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should reject an error when the client fail', done => {
      // Given
      const program = validProgram;
      const error = 'A pas marché';
      setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId = sinon.stub().returns(Promise.reject(error));

      // when / Then
      setGoogleAnalyticsTrackingIdCommand.execute(program, analyticsId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId).to.have.been.calledOnce;
        expect(setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId).to.have.been.calledWithExactly(token, analyticsId);
        done();
      });
    });

    it('should forward to the client an return response when the client request success', done => {
      // Given
      const program = validProgram;
      const account = { apiKey: 'qwertyuiop', username: 'coucou', gaTrackingId: analyticsId };
      setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId = sinon.stub().returns(Promise.resolve(account));

      // when / Then
      setGoogleAnalyticsTrackingIdCommand.execute(program, analyticsId).then(result => {
        expect(result).to.be.equals(account);
        expect(setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleAnalyticsTrackingIdCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId).to.have.been.calledOnce;
        expect(setGoogleAnalyticsTrackingIdCommand.barracks.setGoogleAnalyticsTrackingId).to.have.been.calledWithExactly(token, analyticsId);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});