const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const PackageVersionsCommand = require('../../../src/commands/package/PackageVersionsCommand');
const PageableStream = require('../../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('packageVersionsCommand', () => {

  let packageVersionsCommand;
  const token = 'i8uhkj.token.65ryft';
  const packageReference = 'my.package.ref';
  const validProgram = {
    args: [
      packageReference
    ]
  };

  before(() => {
    packageVersionsCommand = new PackageVersionsCommand();
    packageVersionsCommand.barracks = {};
    packageVersionsCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no argument given', () => {
      // Given
      const program = {
        args: []
      };
      // When
      const result = packageVersionsCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when valid reference given', () => {
      // Given
      const program = validProgram;
      // When
      const result = packageVersionsCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the client request fail', done => {
      // Given
      const error = 'error';
      const program = validProgram;
      packageVersionsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageVersionsCommand.barracks.getPackageVersions = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageVersionsCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(packageVersionsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageVersionsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageVersionsCommand.barracks.getPackageVersions).to.have.been.calledOnce;
        expect(packageVersionsCommand.barracks.getPackageVersions).to.have.been.calledWithExactly(token, packageReference);
        done();
      });
    });

    it('should forward the client response when all is ok', done => {
      // Given
      const response = ['aversion', 'anotherversion', 'andonemoreversion'];
      const program = validProgram;
      packageVersionsCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageVersionsCommand.barracks.getPackageVersions = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageVersionsCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(packageVersionsCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageVersionsCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageVersionsCommand.barracks.getPackageVersions).to.have.been.calledOnce;
        expect(packageVersionsCommand.barracks.getPackageVersions).to.have.been.calledWithExactly(token, packageReference);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
