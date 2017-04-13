const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const DeploymentPlanCommand = require('../../../src/commands/package/DeploymentPlanCommand');
const PageableStream = require('../../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('deploymentPlanCommand', () => {

  let deploymentPlanCommand;
  const token = 'i8uhkj.token.65ryft';
  const packageReference = 'my.component.ref';
  const validProgram = {
    packageReference
  };

  before(() => {
    deploymentPlanCommand = new DeploymentPlanCommand();
    deploymentPlanCommand.barracks = {};
    deploymentPlanCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when reference is missing', () => {
      // Given
      const program = {};
      // When
      const result = deploymentPlanCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when reference has no value', () => {
      // Given
      const program = {packageReference: true};
      // When
      const result = deploymentPlanCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when valid reference given', () => {
      // Given
      const program = validProgram;
      // When
      const result = deploymentPlanCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  })

  describe('#execute(program)', () => {

    it('should return an error when the client request fails', done => {
      // Given
      const error = 'error';
      const program = validProgram;
      deploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deploymentPlanCommand.barracks.getDeploymentPlan = sinon.stub().returns(Promise.reject(error));

      // When / Then
      deploymentPlanCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(deploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deploymentPlanCommand.barracks.getDeploymentPlan).to.have.been.calledOnce;
        expect(deploymentPlanCommand.barracks.getDeploymentPlan).to.have.been.calledWithExactly(token, packageReference);
        done();
      });
    });

    it('should forward the client response when all is ok', done => {
      // Given
      const response = [ 'myGreatDeploymentPlan' ];
      const program = validProgram;
      deploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      deploymentPlanCommand.barracks.getDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      deploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(deploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(deploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(deploymentPlanCommand.barracks.getDeploymentPlan).to.have.been.calledOnce;
        expect(deploymentPlanCommand.barracks.getDeploymentPlan).to.have.been.calledWithExactly(token, packageReference);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});