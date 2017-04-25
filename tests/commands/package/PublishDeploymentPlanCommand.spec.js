const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PublishDeploymentPlanCommand', () => {

  let publishDeploymentPlanCommand;
  let proxyFileExists;
  let proxyReadObjectFromFile;
  let proxyReadObjectFromStdin;
  const token = '345678ujhbvcdsw34rg';
  const file = 'path/to/file.json';
  const validProgram = { file };

  function getProxyCommand() {
    return proxyquire('../../../src/commands/package/PublishDeploymentPlanCommand', {
      '../../utils/Validator': {
        fileExists: (path) => {
          return proxyFileExists(path);
        }
      },
      '../../utils/ObjectReader': {
        readObjectFromFile: (file) => {
          return proxyReadObjectFromFile(file);
        },
        readObjectFromStdin: () => {
          return proxyReadObjectFromStdin();
        }
      }
    });  
  }

  beforeEach(() => {
    const Command = getProxyCommand();
    publishDeploymentPlanCommand = new Command();
    publishDeploymentPlanCommand.barracks = {};
    publishDeploymentPlanCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when no option given', () => {
      // Given
      const program = {};
      // When
      const result = publishDeploymentPlanCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when valid file path given', () => {
      // Given
      const program = validProgram;
      const spyFileExists = sinon.spy();
      proxyFileExists = (file) => {
        spyFileExists(file);
        return true;
      };

      // When
      const result = publishDeploymentPlanCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when invalid file path given', () => {
      // Given
      const program = validProgram;
      const spyFileExists = sinon.spy();
      proxyFileExists = (file) => {
        spyFileExists(file);
        return false;
      };

      // When
      const result = publishDeploymentPlanCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });
  });

  describe('#execute(program)', () => {

    const validPlan = {
      package: 'ze-ref',
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    const invalidPlan = {
      data: {
        some: 'value',
        someOther: 'value'
      }
    };

    it ('should forward to client when valid plan is given as file', done => {
      // Given
      const program = validProgram;
      const spyReadObjectFromFile = sinon.spy();
      const response = 'Yatta.';

      proxyReadObjectFromFile = (file) => {
        spyReadObjectFromFile(file);
        return validPlan;
      };

      publishDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      publishDeploymentPlanCommand.barracks.publishDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      publishDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(publishDeploymentPlanCommand.barracks.publishDeploymentPlan).to.have.been.calledOnce;
        expect(publishDeploymentPlanCommand.barracks.publishDeploymentPlan).to.have.been.calledWithExactly(token, validPlan);
        done();
      }).catch(err => {
       done(err);
      });
    });

    it ('should forward to client when valid plan is given as stream', done => {
      // Given
      const program = {};
      const spyReadObjectFromStdin = sinon.spy();
      const response = 'Yatta.';

      proxyReadObjectFromStdin = () => {
        spyReadObjectFromStdin();
        return validPlan;
      };

      publishDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      publishDeploymentPlanCommand.barracks.publishDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      publishDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(publishDeploymentPlanCommand.barracks.publishDeploymentPlan).to.have.been.calledOnce;
        expect(publishDeploymentPlanCommand.barracks.publishDeploymentPlan).to.have.been.calledWithExactly(token, validPlan);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it ('should return false when plan given is valid JSON but has no package field', done => {
      // Given
      const program = validProgram;
      const spyGetObject = sinon.spy();
      proxyReadObjectFromFile = (program) => {
        spyGetObject(program);
        return invalidPlan;
      };

      publishDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      publishDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(false);expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(publishDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
