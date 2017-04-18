const mockStdin = require('mock-stdin');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('LoginCommand', () => {

  let loginCommand;
  let stdin;
  let mockHostname;
  let spyHostname;
  let mockUserInfo;
  let spyUserInfo;

  const hostname = 'someComputer';
  const localUser = 'someDude';
  const accountEmail = 'coucou-bonjour@un.email';
  const accountPassword = 'guest';
  const token = 'i8uhkj.token.65ryft';
  const serviceErrorMessage = 'error message';
  const programWithValidOptions = {
    email: accountEmail,
    password: accountPassword
  };
  const apiToken = {
    userId:    'qwsdcvdswefbrgnthm',
    label:     localUser + '@' + hostname,
    value:     'eyJhbGciOiJIpPBDwDk2gLAdEPXHnlmItWoV3SWz-0HesSMjE2NjBlMTM4NzYiLCJzdWIiOiJncmVnb2lyZUBiYXJyYWNrcy5n2qmsCaP4moi_q80uJ01yyc3oK2IuH-Wfuw-RF85tL_MDItOUzUxMiJ9.eyJqdGkiOiI3NzM3YWI1OC03N2U1LTQypbyIsImlhdCI6MTQ5MjU0NDAxN30.q-TDllMS04f_eWgQ',
    startDate: '2017-04-18T19:33:37.305Z',
    revoked:   false
  };

  function expectLoginSuccessful(result, loginCommand, withCredentials) {
    expect(result).to.be.equals('Authentication successful');
    expect(loginCommand.authenticate).to.have.been.calledOnce;
    expect(loginCommand.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
    expect(loginCommand.barracks.createToken).to.have.been.calledOnce;
    expect(loginCommand.barracks.createToken).to.have.been.calledWithExactly(token, { label: apiToken.label });
    expect(loginCommand.saveAuthenticationToken).to.have.been.calledOnce;
    expect(loginCommand.saveAuthenticationToken).to.have.been.calledWithExactly(apiToken.value);
    if (!withCredentials) {
      expect(loginCommand.requestUserAuthentication).to.have.been.calledOnce;
      expect(loginCommand.requestUserAuthentication).to.have.been.calledWithExactly();
    }
  }

  describe('#execute(program)', () => {

    beforeEach(() => {
      const LoginCommand = proxyquire('../../src/commands/LoginCommand', {
        'os': {
          hostname: () => {
            return mockHostname();
          },
          userInfo: () => {
            return mockUserInfo();
          }
        }
      });

      loginCommand = new LoginCommand();
      loginCommand.barracks = {};
      loginCommand.userConfiguration = {};
      stdin = mockStdin.stdin();
      spyHostname = sinon.spy();
      spyUserInfo = sinon.spy();
      mockHostname = () => {
        spyHostname();
        return hostname;
      };
      mockUserInfo = () => {
        spyUserInfo();
        return { username: localUser };
      };
    });

    after(() => {
      stdin.end();
    });

    it('should reject an error when createToken fails', (done) => {
      // Given
      const error = 'anError';
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));
      loginCommand.barracks.createToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(loginCommand.authenticate).to.have.been.calledOnce;
        expect(loginCommand.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        done();
      });
    });

    it('should reject an error when saveAuthenticationToken fails', (done) => {
      // Given
      const error = 'anError';
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));
      loginCommand.barracks.createToken = sinon.stub().returns(Promise.resolve(apiToken));
      loginCommand.saveAuthenticationToken = sinon.stub().returns(Promise.reject(error));

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(loginCommand.authenticate).to.have.been.calledOnce;
        expect(loginCommand.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        expect(loginCommand.barracks.createToken).to.have.been.calledOnce;
        expect(loginCommand.barracks.createToken).to.have.been.calledWithExactly(token, { label: apiToken.label });
        done();
      });
    });

    it('should return "Authentication successful" when all the options are present and credentials are valid', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));
      loginCommand.barracks.createToken = sinon.stub().returns(Promise.resolve(apiToken));
      loginCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken.value));

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand, true);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should truncate hostname and localusername if too long when creating the token label', (done) => {
      // Given
      const longHostname = 'aSuperLongHostnameqwertyuiopasdfghjkllzxcvbnm';
      const longUsername = 'aSuperLongUsernameqwertyuiopasdfghjklzxcvbnm';
      mockHostname = () => {
        spyHostname();
        return longHostname;
      };
      mockUserInfo = () => {
        spyUserInfo();
        return { username: longUsername };
      };
      const fullLabel = longUsername + '@' + longHostname;
      const expectedLabel = fullLabel.substring(0, 50);
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));
      loginCommand.barracks.createToken = sinon.stub().returns(Promise.resolve(apiToken));
      loginCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken.value));

      // When / Then
      loginCommand.execute(program).then(result => {
        expect(result).to.be.equals('Authentication successful');
        expect(loginCommand.authenticate).to.have.been.calledOnce;
        expect(loginCommand.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        expect(loginCommand.barracks.createToken).to.have.been.calledOnce;
        expect(loginCommand.barracks.createToken).to.have.been.calledWithExactly(token, { label: expectedLabel });
        expect(loginCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(loginCommand.saveAuthenticationToken).to.have.been.calledWithExactly(apiToken.value);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error when all the options are present but credentials are invalid', (done) => {
      // Given
      const wrongEmail = 'wrongEmail';
      const wrongPassword = 'wrongPassword';
      const program = {
        email: wrongEmail,
        password: wrongPassword
      };
      loginCommand.authenticate = sinon.stub().returns(Promise.reject(serviceErrorMessage));

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(serviceErrorMessage);
        expect(loginCommand.authenticate).to.have.been.calledOnce;
        expect(loginCommand.authenticate).to.have.been.calledWithExactly(wrongEmail, wrongPassword);
        done();
      });
    });

    it('should ask for credentials and return "Authentication successful" when credentials typed ad not given in command', (done) => {
      // Given
      const program = { email: undefined, password: undefined };
      authResponse = { email: accountEmail, password: accountPassword };
      loginCommand.requestUserAuthentication = sinon.stub().returns(Promise.resolve(authResponse));
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));
      loginCommand.barracks.createToken = sinon.stub().returns(Promise.resolve(apiToken));
      loginCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(apiToken.value));

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand, false);
        done()
      }).catch(err => {
        done('Should have succeeded');
      });
    });
  });
});