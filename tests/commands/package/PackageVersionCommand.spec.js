const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const PackageVersionCommand = require('../../../src/commands/package/PackageVersionCommand');
const PageableStream = require('../../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('packageVersionCommand', () => {

  let packageVersionCommand;
  const token = 'i8uhkj.token.65ryft';
  const packageReference = 'my.component.ref';
  const versionId = '1.3.1';
  const validProgram = {
    args: [
      packageReference,
      versionId
    ]
  };

  before(() => {
    packageVersionCommand = new PackageVersionCommand();
    packageVersionCommand.barracks = {};
    packageVersionCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no argument given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = packageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when one argument given', () => {
      // Given
      const program = { args: ['plop'] };
      // When
      const result = packageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when more than two arguments given', () => {
      // Given
      const program = { args: ['plop', 'replop', 'rereplop'] };
      // When
      const result = packageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when two arguments given', () => {
      // Given
      const program = validProgram;
      // When
      const result = packageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the client request fails', done => {
      // Given
      const error = 'error';
      const program = validProgram;
      packageVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageVersionCommand.barracks.getVersion = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageVersionCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(packageVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageVersionCommand.barracks.getVersion).to.have.been.calledOnce;
        expect(packageVersionCommand.barracks.getVersion).to.have.been.calledWithExactly(token, packageReference, versionId);
        done();
      });
    });

    it('should forward the client response when all is ok', done => {
      // Given
      const response = {
        versionId,
        packageReference
      };
      const program = validProgram;
      packageVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageVersionCommand.barracks.getVersion = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageVersionCommand.execute(program).then(result => {
        expect(result).to.deep.equals(response);
        expect(packageVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageVersionCommand.barracks.getVersion).to.have.been.calledOnce;
        expect(packageVersionCommand.barracks.getVersion).to.have.been.calledWithExactly(token, packageReference, versionId);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});