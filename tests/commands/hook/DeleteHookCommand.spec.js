const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const DeleteHookCommand = require('../../../src/commands/hook/DeleteHookCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

let deleteHookCommand;

describe('DeleteHookCommand', () => {

  before(() => {
    deleteHookCommand = new DeleteHookCommand();
    deleteHookCommand.barracks = {};
    deleteHookCommand.userConfiguration = {};
  });

  describe('#configureCommand(program)', () => {

    it('should configure one argument to the command', () => {
      // Given
      const argumentsSpy = sinon.spy();
      const args = [];
      const program = {
        arguments: arg => {
          argumentsSpy(arg);
          args.push(arg);
          return program;
        },
        args
      };

      // When
      const result = deleteHookCommand.configureCommand(program);

      // Then
      expect(result).to.be.equals(program);
      expect(args[0]).to.be.equals('<hook-name>');
      expect(argumentsSpy).to.have.been.calledOnce;
      expect(argumentsSpy).to.have.been.calledWithExactly('<hook-name>');
    });
  });

  describe('#validateCommand(program)', () => {

    it('should return true when the hook name is given', () => {
      // Given
      const program = { args: ['hookName'] };
      // When
      const result = deleteHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  
    it('should return false when no name given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = deleteHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute()', () => {

    const token = 'jce4567ujnbcfyuj';
    const hookName = 'aHook';
    const program = {
      args: [ hookName ]
    };

    it('should forward to barracks client and reject error when request fail', done => {
      // Given
      const error = 'there was an error !';
      deleteHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deleteHookCommand.barracks.deleteHook = sinon.stub().returns(Promise.reject(error)),

      // When / Then
      deleteHookCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.equal(error);
        expect(deleteHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deleteHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deleteHookCommand.barracks.deleteHook).to.have.been.calledOnce;
        expect(deleteHookCommand.barracks.deleteHook).to.have.been.calledWithExactly(token, hookName);
        done();
      });
    });

    it('should forward to barracks client and return response when request success', done => {
      // Given
      deleteHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deleteHookCommand.barracks.deleteHook = sinon.stub().returns(Promise.resolve()),

      // When / Then
      deleteHookCommand.execute(program).then(result => {
        expect(result).to.equal(undefined);
        expect(deleteHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deleteHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deleteHookCommand.barracks.deleteHook).to.have.been.calledOnce;
        expect(deleteHookCommand.barracks.deleteHook).to.have.been.calledWithExactly(token, hookName);
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });
  });
});