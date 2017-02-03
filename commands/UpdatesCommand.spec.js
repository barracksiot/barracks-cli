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

    it('should call getUpdates when no segment id given and return the client response', (done) => {
      // Given
      const clientResponse = 'response';

      updatesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updatesCommand.barracks = {
        getUpdatesBySegment: sinon.stub().returns(Promise.resolve(clientResponse)),
        getUpdates: sinon.stub().returns(Promise.resolve(clientResponse))
      };

      // When / Then
      updatesCommand.execute().then(result => {
        expect(result).to.equal(clientResponse);
        expect(updatesCommand.barracks.getUpdatesBySegment).to.not.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdates).to.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdates).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

    it('should call getUpdatesBySegment when a segment id is given and return the client response', (done) => {
      // Given
      const segmentId = 'mySegmentId';
      const program = { segment: segmentId };
      const clientResponse = 'response';

      updatesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updatesCommand.barracks = {
        getUpdatesBySegment: sinon.stub().returns(Promise.resolve(clientResponse)),
        getUpdates: sinon.stub().returns(Promise.resolve(clientResponse))
      };

      // When / Then
      updatesCommand.execute(program).then(result => {
        expect(result).to.equal(clientResponse);
        expect(updatesCommand.barracks.getUpdates).to.not.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdatesBySegment).to.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdatesBySegment).to.have.been.calledWithExactly(token, segmentId);
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

  });

});