const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const UpdatesCommand = require('../../../src/commands/update/UpdatesCommand');
const PageableStream = require('../../../src/clients/PageableStream');

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
        getUpdatesBySegmentId: sinon.stub().returns(Promise.resolve(clientResponse)),
        getUpdates: sinon.stub().returns(Promise.resolve(clientResponse))
      };

      // When / Then
      updatesCommand.execute().then(result => {
        expect(result).to.equal(clientResponse);
        expect(updatesCommand.barracks.getUpdatesBySegmentId).to.not.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdates).to.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdates).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

    it('should call getUpdatesBySegmentId when a segment id is given and return the client response', (done) => {
      // Given
      const segmentId = 'mySegmentId';
      const segmentName = 'mySegmentName';
      const segment = { id: segmentId, name: segmentName }
      const program = { segment: segmentName };
      const clientResponse = 'response';

      updatesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updatesCommand.barracks = {
        getUpdatesBySegmentId: sinon.stub().returns(Promise.resolve(clientResponse)),
        getUpdates: sinon.stub().returns(Promise.resolve(clientResponse)),
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
      };

      // When / Then
      updatesCommand.execute(program).then(result => {
        expect(result).to.equal(clientResponse);
        expect(updatesCommand.barracks.getUpdates).to.not.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdatesBySegmentId).to.have.been.calledOnce;
        expect(updatesCommand.barracks.getUpdatesBySegmentId).to.have.been.calledWithExactly(token, segmentId);
        expect(updatesCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(updatesCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segmentName);
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

  });

});