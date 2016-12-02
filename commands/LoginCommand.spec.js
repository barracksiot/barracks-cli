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

  function expectLoginSuccessful(result, loginCommand) {
    expect(result).to.be.equals('Authentication successful');
    expect(loginCommand.barracks.authenticate).to.have.been.calledOnce;
    expect(loginCommand.barracks.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
    expect(loginCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledOnce;
    expect(loginCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledWithExactly(token);
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
      loginCommand.userConfiguration = {
        saveAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand);
        done();
      }).catch(err => {
        done('Should have succeeded');
      });
    });

    it('should return an error when all the options are present but credentials are invalid', (done) => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(serviceErrorMessage))
      };

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(serviceErrorMessage);
        expect(loginCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(loginCommand.barracks.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        done();
      });
    });

    it('should ask for credentials and return "Authentication successful" when "email" option missing and user give valid credentials', (done) => {
      // Given
      const program = Object.assign({}, { email: undefined, password: 'anotherPassword' });
      loginCommand.userConfiguration = {
        saveAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand);
        done()
      }).catch(err => {
        done('Should have succeeded');
      });
    });

    it('should ask for credentials and return "Authentication successful" when "password" option missing and user give valid credentials', (done) => {
      // Given
      const program = Object.assign({}, { email: 'anotherEmail', password: undefined });
      loginCommand.userConfiguration = {
        saveAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand);
        done()
      }).catch(err => {
        done('Should have succeeded');
      });
    });

    it('should ask for credentials and return "Authentication successful" when no option given and user give valid credentials', (done) => {
      // Given
      const program = {};
      loginCommand.userConfiguration = {
        saveAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        expectLoginSuccessful(result, loginCommand);
        done()
      }).catch(err => {
        done('Should have succeeded');
      });
    });

    it('should ask for credentials and return "Authentication successful" when "email" option missing and user give invalid credentials', (done) => {
      // Given
      const program = Object.assign({}, { email: undefined, password: 'anotherPassword' });
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(serviceErrorMessage))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(serviceErrorMessage);
        expect(loginCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(loginCommand.barracks.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        done();
      });
    });

    it('should ask for credentials and return "Authentication successful" when "password" option missing and user give invalid credentials', (done) => {
      // Given
      const program = Object.assign({}, { email: 'anotherEmail', password: undefined });
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(serviceErrorMessage))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(serviceErrorMessage);
        expect(loginCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(loginCommand.barracks.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        done();
      });
    });

    it('should ask for credentials and return "Authentication successful" when no option given and user give invalid credentials', (done) => {
            // Given
      const program = Object.assign({}, { email: 'anotherEmail', password: undefined });
      loginCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(serviceErrorMessage))
      };

      mockStdinCredentials(stdin, accountEmail, accountPassword);

      // When / Then
      loginCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(serviceErrorMessage);
        expect(loginCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(loginCommand.barracks.authenticate).to.have.been.calledWithExactly(accountEmail, accountPassword);
        done();
      });
    });
  });
});