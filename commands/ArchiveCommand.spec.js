const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const ArchiveCommand = require('./ArchiveCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);


describe('ArchiveCommand', () => {

  const archivedUpdate = { 
    uuid: 'e89c3306-df2d-4651-ac35-ad5789203b7b',
    userId: '57c068e90cf2344c1a633622',
    revisionId: 4,
    name: 'pouet',
    description: null,
    packageInfo: { 
      id: '581ca89f0cf2d5adfc157a2c',
      userId: '57c068e90cf2344c1a633622',
      fileName: 'unsecure-0.0.1-alpha.tar.gz',
      md5: 'd3e305c587acd556ec8138f4d8d85f6f',
      size: 3540,
      versionId: 'frrfrf' 
    },
    additionalProperties: {},
    creationDate: '2016-11-28T22:59:45.180Z',
    status: 'archived',
    channel: { 
      id: '57c08b9a0cf21701895daa9e',
      name: 'Production',
      userId: '57c068e90cf2344c1a633622',
      userDefault: true 
    } 
  };
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
  const token = 's5d6f.657fgyi.d6tfuyg';
  let archiveCommand;

  before(() => {
    archiveCommand = new ArchiveCommand();
    archiveCommand.barracks = {};
    archiveCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when the update uuid is given', () => {
      // Given
      const program = { args: ['1234567890poiuytrewq'] };

      // When
      const result = archiveCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  
    it('should return false when no update uuid given', () => {
      // Given
      const program = { args: [] };

      // When
      const result = archiveCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute()', () => {
  
    it('should return an archived update when the request was successful', done => {
      // Given
      const program = {
        args: [ 'MyID' ]
      };
      archiveCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      archiveCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        archiveUpdate: sinon.stub().returns(Promise.resolve(archivedUpdate))
      };

      // When / Then
      archiveCommand.execute(program).then(result => {
        expect(result).to.equal(archivedUpdate);
        expect(archiveCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(archiveCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledOnce;
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledWithExactly(token, program.args[0]);
        expect(archiveCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });

    it('should return an error when the request failed', done => {
      // Given
      const program = {
        args: [ 'MyID' ]
      };
      archiveCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      archiveCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        archiveUpdate: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      archiveCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equal('Error');
        expect(archiveCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(archiveCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledOnce;
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledWithExactly(token, program.args[0]);
        expect(archiveCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        done();
      });
    });

    it('should return an error when the request failed', done => {
      // Given
      const program = {
        args: [ 'MyID' ]
      };
      archiveCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      archiveCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        archiveUpdate: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      archiveCommand.execute(program).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.equal('Error');
        expect(archiveCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(archiveCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledOnce;
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.calledWithExactly(token, program.args[0]);
        expect(archiveCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        done();
      });
    });
  });
});