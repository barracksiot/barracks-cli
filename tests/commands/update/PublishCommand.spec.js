const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const PublishCommand = require('../../../src/commands/update/PublishCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PublishCommand', () => {

  const publishedUpdate = { 
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
  const token = 's5d6f.657fgyi.d6tfuyg';
  const programWithValidOptions = { args: [ 'updateuuid' ] };
  let publishCommand;

  describe('#validateCommand(program)', () => {

    before(() => {
      publishCommand = new PublishCommand();
      publishCommand.barracks = {};
      publishCommand.userConfiguration = {};
    });

    it('should return false when no args', () => {
      // Given
      const program = { };

      // When
      const result = publishCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty args', () => {
      // Given
      const program = { args: [] };

      // When
      const result = publishCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when update uuid is given', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = publishCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute()', () => {

    before(() => {
      publishCommand = new PublishCommand();
      publishCommand.barracks = {};
      publishCommand.userConfiguration = {};
    });
  
    it('should call for publish update when update uuid given', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      publishCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      publishCommand.barracks = {
        publishUpdate: sinon.stub().returns(Promise.resolve(publishedUpdate))
      };

      // When / Then
      publishCommand.execute(program).then(result => {
        expect(result).to.equal(publishedUpdate);
        expect(publishCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(publishCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(publishCommand.barracks.publishUpdate).to.have.been.calledOnce;
        expect(publishCommand.barracks.publishUpdate).to.have.been.calledWithExactly(token, program.args[0]);
        done();
      }).catch(err => {
        done(err);
      });
    });

  });

});
