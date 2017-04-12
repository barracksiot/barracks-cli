const PageableStream = require('../../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const PackagesCommand = require('../../../src/commands/package/PackagesCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PackagesCommand', () => {

  let packagesCommand;
  const token = '0n,dfhg73mfbdyu8543';

  before(() => {
    packagesCommand = new PackagesCommand();
    packagesCommand.barracks = {};
    packagesCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true', () => {
      // Given
      const program = {};
      // When
      const result = packagesCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#configureCommand(program)', () => {

    it('should return the program without change', () => {
      // Given
      const program = {};

      // When
      const result = packagesCommand.configureCommand(program);

      // Then
      expect(result).to.be.equal(program);
    });

  });

  describe('#execute(program)', () => {

    const program = {};  

    it('should reject an error when client fail', done => {
      // Given
      const error = 'An error';
      packagesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packagesCommand.barracks.getComponents = sinon.stub().returns(Promise.reject(error));

      // when / Then
      packagesCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(packagesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packagesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packagesCommand.barracks.getComponents).to.have.been.calledOnce;
        expect(packagesCommand.barracks.getComponents).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should forward response from client', done => {
      // Given
      const response = [ 'acomponent', 'anothercomponent' ];
      packagesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packagesCommand.barracks.getComponents = sinon.stub().returns(Promise.resolve(response));

      // when / Then
      packagesCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(packagesCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packagesCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packagesCommand.barracks.getComponents).to.have.been.calledOnce;
        expect(packagesCommand.barracks.getComponents).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      }).catch(err => {
      });
    });
  });
});