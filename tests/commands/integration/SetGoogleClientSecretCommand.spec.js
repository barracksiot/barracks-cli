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

describe('SetBigQueryClientSecretCommand', () => {

  let setGoogleClientSecretCommand;
  let proxyIsJsonObject;
  let proxyFileExists;
  let proxyInStream = new Stream();
  let proxyReadFile;
  let spyOnError;
  let spyOnData;
  let spyOnClose;
  const token = '789ze5df1s354q984e';
  const file = 'path/to/file.json';
  const validProgram = { file };

  function getProxyCommand() {
    return proxyquire('../../../src/commands/integration/SetGoogleClientSecretCommand', {
      '../../utils/Validator': {
        isJsonObject: (str) => {
          return proxyIsJsonObject(str);
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
    setGoogleClientSecretCommand = new Command();
    setGoogleClientSecretCommand.barracks = {};
    setGoogleClientSecretCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when no option given', () => {
      // Given
      const program = {};
      // When
      const result = setGoogleClientSecretCommand.validateCommand(program);
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
      const result = setGoogleClientSecretCommand.validateCommand(program);

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
      const result = setGoogleClientSecretCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });
  });
  describe('#execute(program)', () => {

    const validSecret = {
      web: {
        client_id: 'aRandomClientId',
        project_id: 'aRandomProjectId',
        auth_uri: 'aRandomAuthenticationURI',
        token_uri: 'aRandomTokenURI',
        client_secret: 'aRandomClientSecret'
      }
    };

    it('should reject an error if input stream return an error', done => {
      // Given
      const program = {};
      const error = 'Stream error';
      spyOnError = sinon.spy();
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      setTimeout(() => {
        proxyInStream.emit('error', error);
      }, 50);

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnError).to.have.been.calledOnce;
        expect(spyOnError).to.have.been.calledWithExactly(error);
        done();
      });
    });

    it('should reject an error when input stream gives invalid JSON data', done => {
      // Given
      const program = {};
      const data = 'some { invalid: "json string"}';
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return false;
      };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      setTimeout(() => {
        proxyInStream.emit('data', data);
        proxyInStream.emit('close');
      }, 50);

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Client secret must be described by a valid JSON');
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should reject when JSON client secret does not contain a client_id reference', done => {
      // Given
      const program = {};
      const secret = { 'web': { 'not_a_client_id': 'json string' } };
      const data = '{ "web": { "not_a_client_id": "json string" } }';
      const response = 'youpi';
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return true;
      };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      setTimeout(() => {
        proxyInStream.emit('data', data);
        proxyInStream.emit('close');
      }, 50);

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Missing mandatory attribute "client_id" in client secret');
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should forward to client and return result when input stream gives valid JSON data', done => {
      // Given
      const program = {};
      const data = JSON.stringify(validSecret);
      const response = 'youpi';
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return true;
      };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleClientSecretCommand.barracks.setGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      setTimeout(() => {
        proxyInStream.emit('data', data);
        proxyInStream.emit('close');
      }, 50);

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledWithExactly(token, validSecret);
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
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
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
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return false;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Client secret must be described by a valid JSON');
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should forward to client and return result when file contains valid JSON data but no client_id', done => {
      // Given
      const program = { file };
      const secret = { 'web': { 'not_a_client_id': 'json string' } };
      const data = '{ "web": { "not_a_client_id": "json string" } }';
      const response = 'youpi';
      const spyReadFile = sinon.spy();
      proxyReadFile = (file, callback) => {
        spyReadFile(file, callback);
        callback(undefined, data);
      };
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return true;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Missing mandatory attribute "client_id" in client secret');
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it('should forward to client and return result when file contains valid JSON data', done => {
      // Given
      const program = { file };
      const data = JSON.stringify(validSecret);
      const response = 'youpi';
      const spyReadFile = sinon.spy();
      proxyReadFile = (file, callback) => {
        spyReadFile(file, callback);
        callback(undefined, data);
      };
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return true;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleClientSecretCommand.barracks.setGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(spyReadFile).to.have.been.calledOnce;
        expect(spyReadFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledWithExactly(token, validSecret);
        done()
      }).catch(err => {
        done(err);
      });
    });
  });
});