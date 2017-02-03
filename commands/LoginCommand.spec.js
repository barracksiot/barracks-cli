const mockStdin = require('mock-stdin');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const LoginCommand = require('./LoginCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('LoginCommand', () => {

  let loginCommand;
  let stdin;

  const accountEmail = 'coucou-bonjour@un.email';
  const accountPassword = 'guest';
  const token = 'i8uhkj.token.65ryft';
  const serviceErrorMessage = 'error message';
  const programWithValidOptions = {
    email: accountEmail,
    password: accountPassword
  };

  function expectLoginSuccessful(result, loginCommand, withCredentials) {
    expect(result).to.be.equals('Authentication successful');
    expect(loginCommand.authenticate).to.have.been.calledOnce;
    expect(loginCommand.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
    if (!withCredentials) {
      expect(loginCommand.requestUserAuthentication).to.have.been.calledOnce;
      expect(loginCommand.requestUserAuthentication).to.have.been.calledWithExactly();
    }
  }

  function mockStdinCredentials(stdin, email, password) {
    setTimeout(() => {
      stdin.send(`${email}\r`);
      setTimeout(() => {
        stdin.send(`${password}\r`);
      }, 100);
    }, 100);
  }

  describe('#execute(program)', () => {

    before(() => {
      loginCommand = new LoginCommand();
      loginCommand.barracks = {};
      loginCommand.userConfiguration = {};
      stdin = mockStdin.stdin();
    });

    after(() => {
      stdin.end();
    });

    it('should return "Authentication successful" when all the options are present and credentials are valid', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.authenticate = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand, true);
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