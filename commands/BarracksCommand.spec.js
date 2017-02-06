const mockStdin = require('mock-stdin');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const BarracksCommand = require('./BarracksCommand');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('BarracksCommand', () => {

  let barracksCommand;
  let stdin;
  let mockedRead;

  const account = {
    firstName: 'John',
    lastName: 'Doe',
    company: 'Plop and Cie',
    phone: '1234567890',
    id: '57c068',
    email: 'john@doe.com',
    apiKey: 'da9d4d6a47547c8ed313fee8',
    status: 'active' 
  };
  const accountPassword = 'guest';
  const token = 's5d6f.657fgyi.d6tfuyg';

  function resetCommand() {
    barracksCommand = new BarracksCommand();
    barracksCommand.barracks = {};
    barracksCommand.userConfiguration = {};
  }

  describe('#getAuthenticationToken()', () => {

    before(() => {
      resetCommand();
    });

    it('should return a token when userConfiguration already contains a token', done => {
      // Given
      barracksCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account))
      };
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(barracksCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(barracksCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });

    it('should ask credentials to user if userConfiguration has no token, and return a token if credentials are valid', done => {
      // Given
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('error'))
      };
      barracksCommand.requestUserAuthentication = sinon.stub().returns(Promise.resolve({ email: account.email, password: accountPassword }));
      barracksCommand.authenticate = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledOnce;
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledWithExactly();
        expect(barracksCommand.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should ask credentials to user if userConfiguration has no token, and return an error if credentials are invalid', done => {
      // Given
      const errorMessage = 'Nope !';
      barracksCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('error'))
      };
      barracksCommand.requestUserAuthentication = sinon.stub().returns(Promise.reject(errorMessage));

      // When / Then
      barracksCommand.getAuthenticationToken().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledOnce;
        expect(barracksCommand.requestUserAuthentication).to.have.been.calledWithExactly();
        done();
      });
    });
  });

  describe('#requestUserAuthentication()', () => {

    before(() => {
      resetCommand();
      stdin = mockStdin.stdin();
    });

    after(() => {
      resetCommand();
      stdin.end();
    });

    it('should read login and password from console input', done => {

      setTimeout(() => {
        stdin.send(`${account.email}\r`);
        setTimeout(() => {
          stdin.send(`${accountPassword}\r`);
        }, 100);
      }, 100);

      // When / Then
      barracksCommand.requestUserAuthentication().then(result => {
        expect(result).to.not.be.null;
        expect(result).to.not.be.undefined;
        expect(result).to.have.ownProperty('email');
        expect(result.email).to.be.equals(account.email);
        expect(result).to.have.ownProperty('password');
        expect(result.password).to.be.equals(accountPassword);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject error if email read fail', done => {
      // Given
      const error = 'error';
      const checkMockedRead = sinon.spy();
      const MockedBarracksCommand = proxyquire('./BarracksCommand', {
        'read': (options, callback) => {
          return mockedRead(options, callback);
        }
      });
      mockedBarracksCommand = new MockedBarracksCommand();
      mockedRead = (options, callback) => {
        checkMockedRead(options, callback);
        callback(error);
      };

      // When / Then
      mockedBarracksCommand.requestUserAuthentication().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(checkMockedRead).to.have.been.calledOnce;
        expect(checkMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Account e-mail: ' },
          sinon.match.func
        );
        done();
      });
    });

    it('should reject error if password read fail', done => {
      // Given
      let mockCallCount = 0;
      const error = 'error';
      const checkFirstMockedRead = sinon.spy();
      const checkSecondMockedRead = sinon.spy();
      const MockedBarracksCommand = proxyquire('./BarracksCommand', {
        'read': (options, callback) => {
          return mockedRead(options, callback);
        }
      });
      mockedBarracksCommand = new MockedBarracksCommand();
      mockedRead = (options, callback) => {
        if (mockCallCount === 0) {
          checkFirstMockedRead(options, callback);
          callback(undefined, account.email);
        } else {
          checkSecondMockedRead(options, callback);
          callback(error);
        }
        ++mockCallCount;
      };

      // When / Then
      mockedBarracksCommand.requestUserAuthentication().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(checkFirstMockedRead).to.have.been.calledOnce;
        expect(checkFirstMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Account e-mail: ' },
          sinon.match.func
        );
        expect(checkSecondMockedRead).to.have.been.calledOnce;
        expect(checkSecondMockedRead).to.have.been.calledWithExactly(
          { prompt: 'Password: ', silent: true },
          sinon.match.func
        );
        done();
      });
    });
  });

  describe('#authenticate()', () => {

    before(() => {
      resetCommand();
    });

    it('should return a token when valid credentials given', done => {
      // Given
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };
      barracksCommand.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(token));

      // When / Then
      barracksCommand.authenticate(account.email, accountPassword).then(result => {
        expect(result).to.equals(token);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error token when invalid credentials given', done => {
      // Given
      const badEmail = 'plop@plop.com';
      const badPassword = 'password';
      const errorMessage = 'Invalid credentials';
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject(errorMessage))
      };

      // When / Then
      barracksCommand.authenticate(badEmail, badPassword).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals(errorMessage);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(badEmail, badPassword);
        done();
      });
    });

    it('should return an error token when saveAuthenticationToken fail', done => {
      // Given
      const errorMessage = 'A marche po';
      barracksCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token))
      };
      barracksCommand.saveAuthenticationToken = sinon.stub().returns(Promise.reject(errorMessage));

      // When / Then
      barracksCommand.authenticate(account.email, accountPassword).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals(errorMessage);
        expect(barracksCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(barracksCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, accountPassword);
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      });
    });
  });

  describe('#saveAuthenticationToken()', () => {

    before(() => {
      resetCommand();
    });

    it('should call save token of userConfiguration', done => {
      // Given
      const response = 'coucou';
      barracksCommand.userConfiguration.saveAuthenticationToken = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracksCommand.saveAuthenticationToken(token).then(result => {
        expect(result).to.equals(response);
        expect(barracksCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledOnce;
        expect(barracksCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#execute()', () => {

    before(() => {
      resetCommand();
    });

    it('should reject to make sure it is overridden', done => {
      // When / Then
      barracksCommand.execute().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equals('Need to be overridden');
        done();
      });
    });
  });
});