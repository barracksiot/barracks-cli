const mockStdin = require('mock-stdin');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const AccountCommand = require('./AccountCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);


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
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      accountCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account))
      };

      // When / Then
      accountCommand.execute().then(result => {
        expect(result).to.equal(account);
        expect(accountCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(accountCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
      });
    });

    it('should request authentication and return account when no token exist and credentials are valid', (done) => {
      // Given
      accountCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('No token')),
        saveAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      
      accountCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.resolve(token)),
        getAccount: sinon.stub().returns(Promise.resolve(account))
      };
      
      setTimeout(() => {
        stdin.send(`${account.email}\r`);
        setTimeout(() => {
          stdin.send(`${password}\r`);
        }, 100);
      }, 100);
      
      // When / Then
      accountCommand.execute().then(result => {
        expect(result).to.equal(account);
        expect(accountCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(accountCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, password);
        expect(accountCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(accountCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(accountCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledOnce;
        expect(accountCommand.userConfiguration.saveAuthenticationToken).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should request authentication and fail when no token exist and credentials are invalid', (done) => {
      // Given
      accountCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.reject('No token'))
      };
      
      accountCommand.barracks = {
        authenticate: sinon.stub().returns(Promise.reject('Error'))
      };
      
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
        expect(accountCommand.barracks.authenticate).to.have.been.calledOnce;
        expect(accountCommand.barracks.authenticate).to.have.been.calledWithExactly(account.email, password);
        expect(accountCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        done();
      });
    });

  });



});