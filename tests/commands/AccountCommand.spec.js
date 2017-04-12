const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const AccountCommand = require('../../src/commands/AccountCommand');

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

  describe('#execute()', () => {

    before(() => {
      accountCommand = new AccountCommand();
      accountCommand.barracks = {};
      accountCommand.userConfiguration = {};
    });
  
    it('should return account information when the token is valid and Barracks client return it', done => {
      // Given
      accountCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      accountCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account))
      };

      // When / Then
      accountCommand.execute().then(result => {
        expect(result).to.equal(account);
        expect(accountCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(accountCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(accountCommand.getAuthenticationToken).to.have.been.calledOnce;
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should fail when no token', done => {
      // Given
      accountCommand.getAuthenticationToken = sinon.stub().returns(Promise.reject('No token'));
      accountCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.reject('Error'))
      };
      
      // When / Then
      accountCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(accountCommand.barracks.getAccount).to.have.not.been.calledOnce;
        expect(accountCommand.getAuthenticationToken).to.have.been.calledOnce;
        done();
      });
    });

  });



});