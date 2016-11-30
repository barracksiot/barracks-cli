"use strict";

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const UpdatesCommand = require('./UpdatesCommand');
const PageableStream = require('../clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UpdatesCommand', () => {

  let updatesCommand;
  const token = 'i8uhkj.token.65ryft';
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

  describe('#execute()', () => {

    before(() => {
      updatesCommand = new UpdatesCommand();
      updatesCommand.barracks = {};
      updatesCommand.userConfiguration = {};
    });

    it('should return a pageable stream when the get updates request is successful', (done) => {
      // Given
      const stream = new PageableStream();
      updatesCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      updatesCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getUpdates: sinon.stub().returns(Promise.resolve(stream))
      };

      // When / Then
      updatesCommand.execute().then(result => {
        expect(result).to.equal(stream);
        expect(updatesCommand.userConfiguration.getAuthenticationToken.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getAccount.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getAccount.calledWithExactly(token)).to.be.true;
        expect(updatesCommand.barracks.getUpdates.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getUpdates.calledWithExactly(token)).to.be.true;
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

    it('should return an error when the get updates request failed', (done) => {
      // Given
      updatesCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      updatesCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getUpdates: sinon.stub().returns(Promise.reject('error'))
      };

      // When / Then
      updatesCommand.execute().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(updatesCommand.userConfiguration.getAuthenticationToken.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getAccount.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getAccount.calledWithExactly(token)).to.be.true;
        expect(updatesCommand.barracks.getUpdates.calledOnce).to.be.true;
        expect(updatesCommand.barracks.getUpdates.calledWithExactly(token)).to.be.true;
        done();
      });
    });

  });

});