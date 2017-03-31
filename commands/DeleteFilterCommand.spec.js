const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const DeleteFilterCommand = require('./DeleteFilterCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

let deleteFilterCommand;

describe('DeleteFilterCommand', () => {

  before(() => {
    deleteFilterCommand = new DeleteFilterCommand();
    deleteFilterCommand.barracks = {};
    deleteFilterCommand.userConfiguration = {};
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
      const result = deleteFilterCommand.configureCommand(program);

      // Then
      expect(result).to.be.equals(program);
      expect(args[0]).to.be.equals('<filter-name>');
      expect(argumentsSpy).to.have.been.calledOnce;
      expect(argumentsSpy).to.have.been.calledWithExactly('<filter-name>');
    });
  });

  describe('#validateCommand(program)', () => {

    it('should return true when the filter name is given', () => {
      // Given
      const program = { args: ['1234567890poiuytrewq'] };
      // When
      const result = deleteFilterCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  
    it('should return false when no update uuid given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = deleteFilterCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute()', () => {

    const token = 'jce4567ujnbcfyuj';
    const filterName = 'aFilter';
    const program = {
      args: [ filterName ]
    };

    it('should forward to barracks client and reject error when request fail', done => {
      // Given
      const error = 'there was an error !';
      deleteFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deleteFilterCommand.barracks.deleteFilter = sinon.stub().returns(Promise.reject(error)),

      // When / Then
      deleteFilterCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.equal(error);
        expect(deleteFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deleteFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deleteFilterCommand.barracks.deleteFilter).to.have.been.calledOnce;
        expect(deleteFilterCommand.barracks.deleteFilter).to.have.been.calledWithExactly(token, filterName);
        done();
      });
    });

    it('should forward to barracks client and return response when request success', done => {
      // Given
      deleteFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deleteFilterCommand.barracks.deleteFilter = sinon.stub().returns(Promise.resolve()),

      // When / Then
      deleteFilterCommand.execute(program).then(result => {
        expect(result).to.equal(undefined);
        expect(deleteFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deleteFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deleteFilterCommand.barracks.deleteFilter).to.have.been.calledOnce;
        expect(deleteFilterCommand.barracks.deleteFilter).to.have.been.calledWithExactly(token, filterName);
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });
  });
});