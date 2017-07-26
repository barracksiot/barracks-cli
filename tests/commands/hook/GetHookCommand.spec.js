const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const GetHookCommand = require('../../../src/commands/hook/GetHookCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('GetHookCommand', () => {

  let getHookCommand;

  const token = 'i8uhkj.token.65ryft';
  const name = 'MyHook';
  const url = 'https://my.url/callDaHook';
  const programWithValidArgs = {
    args: [ name ]
  };

  before(() => {
    getHookCommand = new GetHookCommand();
    getHookCommand.barracks = {};
    getHookCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when one arg given', () => {
      // Given
      const program = Object.assign({}, programWithValidArgs);
      // When
      const result = getHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when no arg given', () => {
      // Given
      const program = Object.assign({}, programWithValidArgs, { args: [] });
      // When
      const result = getHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when more than one arg given', () => {
      // Given
      const program = Object.assign({}, programWithValidArgs, { args: [ 'plop', 'replop' ] });
      // When
      const result = getHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute(program)', () => {

    it('should reject an error when authentication fail', done => {
      // Given
      const error = 'Error';
      getHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      getHookCommand.execute(programWithValidArgs).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      });
    });

    it('should reject an error when getHook request fail', done => {
      // Given
      const error = 'Error';
      getHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      getHookCommand.barracks.getHook = sinon.stub().returns(Promise.reject(error));

      // When / Then
      getHookCommand.execute(programWithValidArgs).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(getHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(getHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        done();
      });
    });

    it('should resolve the hook when request succeed', done => {
      // Given
      const hook = { name, url };
      getHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      getHookCommand.barracks.getHook = sinon.stub().returns(Promise.resolve(hook));

      // When / Then
      getHookCommand.execute(programWithValidArgs).then(result => {
        expect(result).to.be.equals(hook);
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(getHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(getHookCommand.barracks.getHook).to.have.been.calledOnce;
        expect(getHookCommand.barracks.getHook).to.have.been.calledWithExactly(
          token,
          name
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
