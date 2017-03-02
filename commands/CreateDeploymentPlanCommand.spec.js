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

describe('CreateDeploymentPlanCommand', () => {

  let createDeploymentPlanCommand;
  let proxyIsJsonString;
  let proxyFileExists;
  let proxyInStream = new Stream();
  let proxyReadFile;
  let spyOnError;
  let spyOnData;
  let spyOnClose;
  const token = '345678ujhbvcdsw34rg';
  const file = 'path/to/file.json';
  const validProgram = { file };

  function getProxyCommand() {
    return proxyquire('./CreateDeploymentPlanCommand', {
      '../utils/Validator': {
        isJsonString: (str) => {
          return proxyIsJsonString(str);
        },
        fileExists: (path) => {
          return proxyFileExists(path);
        }
      },
      'in-stream': proxyInStream,
      fs: {
        readFile: (file, callback) => {
          return proxyReadFile(file, callback);
        }
      }
    });  
  }

  beforeEach(() => {
    proxyInStream = new Stream();
    proxyInStream.on('data', data => {
      spyOnData(data);
    });
    proxyInStream.on('close', () => {
      spyOnClose();
    });
    proxyInStream.on('error', error => {
      spyOnError(error);
    });
    const Command = new getProxyCommand();
    createDeploymentPlanCommand = new Command();
    createDeploymentPlanCommand.barracks = {};
    createDeploymentPlanCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when no option given', () => {
      // Given
      const program = {};
      // When
      const result = createDeploymentPlanCommand.validateCommand(program);
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
      const result = createDeploymentPlanCommand.validateCommand(program);

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
      const result = createDeploymentPlanCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });
  });

  describe('#execute(program)', () => {

    it('should reject an error if input stream return an error', done => {
      // Given
      const program = {};
      const error = 'Stream error';
      spyOnError = sinon.spy();
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      setTimeout(() => {
        proxyInStream.emit('error', error);
      }, 50);

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnError).to.have.been.calledOnce;
        expect(spyOnError).to.have.been.calledWithExactly(error);
        done();
      });
    });

    it('should reject an error when input stream give invalid JSON data', done => {
      // Given
      const program = {};
      const data = 'some { invalid: "json string"}';
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (data) => {
        spyIsJsonString(data);
        return false;
      };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      setTimeout(() => {
        proxyInStream.emit('data', data);
        proxyInStream.emit('close');
      }, 50);

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Deployment plan must be described by a valid JSON');
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        expect(spyIsJsonString).to.have.been.calledOnce;
        expect(spyIsJsonString).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should forward to client and return result when input stream give valid JSON data', done => {
      // Given
      const program = {};
      const plan = { 'a-valid': 'json string' };
      const data = '{ "a-valid": "json string" }';
      const response = 'youpi';
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (data) => {
        spyIsJsonString(data);
        return true;
      };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createDeploymentPlanCommand.barracks.createDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      setTimeout(() => {
        proxyInStream.emit('data', data);
        proxyInStream.emit('close');
      }, 50);

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        expect(spyIsJsonString).to.have.been.calledOnce;
        expect(spyIsJsonString).to.have.been.calledWithExactly(data);
        expect(createDeploymentPlanCommand.barracks.createDeploymentPlan).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.barracks.createDeploymentPlan).to.have.been.calledWithExactly(token, plan);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error when option file given and unable to read the file', done => {
      // Given
      const program = { file };
      const error = 'Unable to read file';
      const spyReadFile = sinon.spy();
      proxyReadFile = (file, callback) => {
        spyReadFile(file, callback);
        callback(error);
      };
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        done();
      });
    });

    it('should reject an error when option file given and content is not valid JSON', done => {
      // Given
      const program = { file };
      const data = 'not { a-valid": "json string" }';
      const spyReadFile = sinon.spy();
      proxyReadFile = (file, callback) => {
        spyReadFile(file, callback);
        callback(undefined, data);
      };
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (data) => {
        spyIsJsonString(data);
        return false;
      };
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Deployment plan must be described by a valid JSON');
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(spyIsJsonString).to.have.been.calledOnce;
        expect(spyIsJsonString).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should forward to client and return result when file contains valid JSON data', done => {
      // Given
      const program = { file };
      const plan = { 'a-valid': 'json string' };
      const data = '{ "a-valid": "json string" }';
      const response = 'youpi';
      const spyReadFile = sinon.spy();
      proxyReadFile = (file, callback) => {
        spyReadFile(file, callback);
        callback(undefined, data);
      };
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (data) => {
        spyIsJsonString(data);
        return true;
      };
      createDeploymentPlanCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createDeploymentPlanCommand.barracks.createDeploymentPlan = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createDeploymentPlanCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(spyIsJsonString).to.have.been.calledOnce;
        expect(spyIsJsonString).to.have.been.calledWithExactly(data);
        expect(createDeploymentPlanCommand.barracks.createDeploymentPlan).to.have.been.calledOnce;
        expect(createDeploymentPlanCommand.barracks.createDeploymentPlan).to.have.been.calledWithExactly(token, plan);
        done();
      }).catch(err => {
        done(err);
      });
    });

  });
});
