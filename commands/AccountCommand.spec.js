const mockStdin = require('mock-stdin');
const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const AccountCommand = require('./AccountCommand');

chai.use(chaiAsPromised);
chai.use(spies);


describe('AccountCommand', () => {

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
  const token = '123456WS';
  const password = 'qazwsxedc';

  let accountCommand;
  let stdin;

  describe('#execute()', () => {

    before(() => {
      stdin = mockStdin.stdin();
      accountCommand = new AccountCommand();
      accountCommand.barracks = {};
      accountCommand.userConfiguration = {};
    });

    after(() => {
      stdin.end();
    });
  
    it('should return account information when the token is valid and Barracks client return it', () => {
      // Given
      accountCommand.userConfiguration = {
        getAuthenticationToken: () => Promise.resolve(token)
      };
      chai.spy.on(accountCommand.userConfiguration, 'getAuthenticationToken');
      accountCommand.barracks = {
        getAccount: token => Promise.resolve(account)
      };
      chai.spy.on(accountCommand.barracks, 'getAccount');

      // When / Then
      accountCommand.execute().then(result => {
        expect(result).to.equal(account);
        expect(accountCommand.barracks.getAccount).to.have.been.called.once;
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.called.once;
      });
    });

    it('should request authentication and return account when no token exist and credentials are valid', (done) => {
      // Given
      accountCommand.userConfiguration = {
        getAuthenticationToken: () => Promise.reject('No token'),
        saveAuthenticationToken: () => Promise.resolve(token)
      };
      chai.spy.on(accountCommand.userConfiguration, 'getAuthenticationToken');
      chai.spy.on(accountCommand.userConfiguration, 'saveAuthenticationToken');
      
      accountCommand.barracks = {
        authenticate: (email, password) => Promise.resolve(token),
        getAccount: (token) => Promise.resolve(account)
      };
      chai.spy.on(accountCommand.barracks, 'authenticate');
      chai.spy.on(accountCommand.barracks, 'getAccount');
      
      setTimeout(() => {
        stdin.send(`${account.email}\r`);
        setTimeout(() => {
          stdin.send(`${password}\r`);
        }, 100);
      }, 100);
      
      // When / Then
      accountCommand.execute().then(result => {
        expect(result).to.equal(account);
        expect(accountCommand.barracks.authenticate).to.have.been.called.once;
        expect(accountCommand.barracks.getAccount).to.have.been.called.once;
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.called.once;
        expect(accountCommand.userConfiguration.saveAuthenticationToken).to.have.been.called.once;
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should request authentication and fail when no token exist and credentials are invalid', (done) => {
      // Given
      accountCommand.userConfiguration = {
        getAuthenticationToken: () => Promise.reject('No token')
      };
      chai.spy.on(accountCommand.userConfiguration, 'getAuthenticationToken');
      
      accountCommand.barracks = {
        authenticate: (email, password) => Promise.reject('Error')
      };
      chai.spy.on(accountCommand.barracks, 'authenticate');
      
      setTimeout(() => {
        stdin.send(`${account.email}\r`);
        setTimeout(() => {
          stdin.send(`${password}\r`);
        }, 100);
      }, 100);
      
      // When / Then
      accountCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(accountCommand.barracks.authenticate).to.have.been.called.once;
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.called.once;
        done();
      });
    });

  });



});