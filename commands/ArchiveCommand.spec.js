const mockStdin = require('mock-stdin');
const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const ArchiveCommand = require('./ArchiveCommand');

chai.use(chaiAsPromised);
chai.use(spies);


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
    status: 'published',
    channel: { 
      id: '57c08b9a0cf21701895daa9e',
      name: 'Production',
      userId: '57c068e90cf2344c1a633622',
      userDefault: true 
    } 
  };
  let archiveCommand;
  let stdin;

  describe('#execute()', () => {

    before(() => {
      stdin = mockStdin.stdin();
      archiveCommand = new ArchiveCommand();
      archiveCommand.barracks = {};
      archiveCommand.userConfiguration = {};
    });

    after(() => {
      stdin.end();
    });
  
    it('should return an archived update when the request was successful', () => {
      // Given
      archiveCommand.userConfiguration = {
        getAuthenticationToken: () => Promise.resolve(token)
      };
      chai.spy.on(archiveCommand.userConfiguration, 'getAuthenticationToken');
      archiveCommand.barracks = {
        getAccount: token => Promise.resolve(account),
        archiveUpdate: (token, uuid) => Promise.resolve(archivedUpdate)
      };
      chai.spy.on(archiveCommand.barracks, 'archiveUpdate');

      // When / Then
      archiveCommand.execute().then(result => {
        expect(result).to.equal(archiveUpdate);
        expect(archiveCommand.barracks.getAccount).to.have.been.called.once;
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.called.once;
        expect(archiveCommand.userConfiguration.getAuthenticationToken).to.have.been.called.once;
      });
    });

    it('should return an error when the request failed', () => {
      // Given
      archiveCommand.userConfiguration = {
        getAuthenticationToken: () => Promise.resolve(token)
      };
      chai.spy.on(archiveCommand.userConfiguration, 'getAuthenticationToken');
      archiveCommand.barracks = {
        getAccount: token => Promise.resolve(account),
        archiveUpdate: (token, uuid) => Promise.reject('Error')
      };
      chai.spy.on(archiveCommand.barracks, 'archiveUpdate');

      // When / Then
      archiveCommand.execute().then(result => {
        expect(result).to.equal(archiveUpdate);
        expect(archiveCommand.barracks.getAccount).to.have.been.called.once;
        expect(archiveCommand.barracks.archiveUpdate).to.have.been.called.once;
        expect(archiveCommand.userConfiguration.getAuthenticationToken).to.have.been.called.once;
      });
    });

  });



});