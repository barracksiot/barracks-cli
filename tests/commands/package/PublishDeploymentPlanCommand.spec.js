const mockStdin = require('mock-stdin');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const Stream = require('stream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PublishDeploymentPlanCommand', () => {

  let publishDeploymentPlanCommand;
  let proxyFileExists;
  let proxyGetObject;
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
      '../../utils/FileReader': {
        getObject: (program) => {
          return proxyGetObject(program);
        }
      }
    });  
  }

  beforeEach(() => {

    const Command = new getProxyCommand();
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

    it ('should forward to client when valid plan is given', done => {
      // Given
      const program = validProgram;
      const spyGetObject = sinon.spy();
      const response = 'Yatta.';
      proxyGetObject = (program) => {
        spyGetObject(program);
        return validPlan;
      };

      publishDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      publishDeploymentPlanCommand.barracks.publishDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      publishDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        done();
      }).catch(err => {
       done(err);
      });
    });

    it ('should return false when plan given is valid JSON but has no package field', done => {
      // Given
      const program = validProgram;
      const spyGetObject = sinon.spy();
      proxyGetObject = (program) => {
        spyGetObject(program);
        return invalidPlan;
      };

      publishDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      publishDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(false);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
