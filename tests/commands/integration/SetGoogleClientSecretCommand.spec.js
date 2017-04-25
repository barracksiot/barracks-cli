const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const ObjectReader = require('../../../src/utils/ObjectReader');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SetGoogleClientSecretCommand', () => {

  let setGoogleClientSecretCommand;
  let proxyFileExists;
  let proxyReadObjectFromFile;
  let proxyReadObjectFromStdin;
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

    it ('should forward to client when token is accessed and object is provided as file', done => {
      // Given
      const program = validProgram;
      const response = 'Hello !';
      const spyReadObjectFromFile = sinon.spy();
      proxyReadObjectFromFile = (file) => {
        spyReadObjectFromFile(file);
        return validSecret;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleClientSecretCommand.barracks.setGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledWithExactly(token, validSecret);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it ('should forward to client when token is accessed and object is provided as stream', done => {
      // Given
      const program = {};
      const response = 'Hello !';
      const spyReadObjectFromStdin = sinon.spy();
      proxyReadObjectFromStdin = () => {
        spyReadObjectFromStdin();
        return validSecret;
      };
      setGoogleClientSecretCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      setGoogleClientSecretCommand.barracks.setGoogleClientSecret = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      setGoogleClientSecretCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledOnce;
        expect(setGoogleClientSecretCommand.barracks.setGoogleClientSecret).to.have.been.calledWithExactly(token, validSecret);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});