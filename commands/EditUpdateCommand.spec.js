const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const EditUpdateCommand = require('./EditUpdateCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('EditUpdateCommand', () => {

  let editUpdateCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    uuid: '123456789',
    title: 'Title',
    description: 'Description',
    versionId: 'Version id',
    properties: JSON.stringify({ coucou: 'Plop' }),
    'package': __filename,
    segment: 'Production'
  };

  before(() => {
    editUpdateCommand = new EditUpdateCommand();
    editUpdateCommand.barracks = {};
    editUpdateCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  
    it('should return true when the title is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { title: undefined });

      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when the uuid is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { uuid: undefined });

      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when everything is missing except uuid', () => {
      // Given
      const program = { uuid: programWithValidOptions.uuid };

      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

  });

  describe('#execute(program)', () => {

    const updatePackage = {
      id: "PackageID"
    };

    const segment = {
      id: "SegmentId",
      name: programWithValidOptions.segment
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

    it('should return an error when the get segment request failed', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      editUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      editUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(editUpdateCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        done();
      });
    });

    it('should return an error when the edit update request failed', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks = {
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        editUpdate: sinon.stub().returns(Promise.reject("Error"))
      };

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(token, {
          uuid: program.uuid,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          segmentId: segment.id
        });
        done();
      });
    });

    it('should return the edited update when the edit update request is successful', done => {
      // Given
      const update = {
        uuid: 'bc354c98-bc73-4f90-9eeb-9c1698b988bc'
      };
      const program = Object.assign({}, programWithValidOptions);
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks = {
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        editUpdate: sinon.stub().returns(Promise.resolve(update))
      };

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(token, {
          uuid: program.uuid,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          segmentId: segment.id
        });
        done();
      }).catch(err => {
        done('Should not have failed');
      });
    });

  });

});