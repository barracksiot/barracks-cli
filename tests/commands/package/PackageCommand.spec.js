const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const PackageCommand = require('../../../src/commands/package/PackageCommand');
const PageableStream = require('../../../src/clients/PageableStream');
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('packageCommand', () => {

  let packageCommand;
  const token = 'i8uhkj.token.65ryft';
  const packageReference = 'my.component.ref';
  const validProgram = { args: [
    packageReference
  ]};

  before(() => {
    packageCommand = new PackageCommand();
    packageCommand.barracks = {};
    packageCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no argument given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = packageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when valid reference given', () => {
      // Given
      const program = validProgram;
      // When
      const result = packageCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the client request fails', done => {
      // Given
      const error = 'error';
      const program = validProgram;
      packageCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageCommand.barracks.getPackage = sinon.stub().returns(Promise.reject(error));

      // When / Then
      packageCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(packageCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageCommand.barracks.getPackage).to.have.been.calledOnce;
        expect(packageCommand.barracks.getPackage).to.have.been.calledWithExactly(token, packageReference);
        done();
      });
    });

    it('should forward the client response when everything is ok', done => {
      // Given
      const response = ['myGreatPackage'];
      const program = validProgram;
      packageCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      packageCommand.barracks.getPackage = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      packageCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(packageCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(packageCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(packageCommand.barracks.getPackage).to.have.been.calledOnce;
        expect(packageCommand.barracks.getPackage).to.have.been.calledWithExactly(token, packageReference);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
