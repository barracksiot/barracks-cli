const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const FileReader = require('../../../src/utils/FileReader');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SetBigQueryClientSecretCommand', () => {

  let setGoogleClientSecretCommand;
  let proxyFileExists;
  let proxyGetObject;
  const token = '789ze5df1s354q984e';
  const file = 'path/to/file.json';
  const validProgram = { file };

  function getProxyCommand() {
    return proxyquire('../../../src/commands/integration/SetGoogleClientSecretCommand', {
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

    it ('should forward to client when token is accessed and object is provided as file or stream', done => {
      // Given
      const program = validProgram;
      const response = 'Hello !';
      const spyGetObject = sinon.spy();
      proxyGetObject = (program) => {
        spyGetObject(program);
        return validSecret;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleClientSecretCommand.barracks.setGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});