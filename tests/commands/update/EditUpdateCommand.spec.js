const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('EditUpdateCommand', () => {

  let editUpdateCommand;
  let createFilterCommand;
  let proxyIsJsonString;
  let proxyFileExists;

  const EditUpdateCommand = proxyquire('../../../src/commands/update/EditUpdateCommand', {
    '../../utils/Validator': {
      isJsonString: (str) => {
        return proxyIsJsonString(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }
  });

  const token = 'i8uhkj.token.65ryft';
  const updateUuid = '234567898765432345678';
  const title = 'My Update';
  const description = 'Description of my update';
  const segment = 'SegmentName';
  const properties = JSON.stringify({ data: 'value' });
  const minimalProgram = { args: [updateUuid] };

  before(() => {
    editUpdateCommand = new EditUpdateCommand();
    editUpdateCommand.barracks = {};
    editUpdateCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = { args: [] };
      // When
      const result = editUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when uuid given with no value', () => {
      // Given
      const program = { args: [] };
      // When
      const result = editUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only uuid given', () => {
      // Given
      const program = minimalProgram;
      editUpdateCommand.validateOptionnalParams = sinon.stub().returns(true);

      // When
      const result = editUpdateCommand.validateCommand(program);
      
      // Then
      expect(result).to.be.false;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledOnce;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledWithExactly(
        sinon.match.any,
        ['title', 'description', 'segment', 'properties']
      );
    });

    it('should return false when any optionnal param invalid', () => {
      // Given
      const program = minimalProgram;
      editUpdateCommand.validateOptionnalParams = sinon.stub().returns(false);
     
      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledOnce;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledWithExactly(
        sinon.match.any,
        ['title', 'description', 'segment', 'properties']
      );
    });

    it('should return true when at least on optionnal valid param given', () => {
      // Given
      const program = Object.assign({}, minimalProgram, { segment });
      editUpdateCommand.validateOptionnalParams = sinon.stub().returns(true);
     
      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledOnce;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledWithExactly(
        sinon.match.any,
        ['title', 'description', 'segment', 'properties']
      );
    });

    it('should return false when invalid JSON given as properties', () => {
      // Given
      const invalidProperties = 'srtdg{ ekrjhg}';
      const program = Object.assign({}, minimalProgram, { properties: invalidProperties });
      editUpdateCommand.validateOptionnalParams = sinon.stub().returns(true);
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (str) => {
        spyIsJsonString(str);
        return false;
      }
     
      // When
      const result = editUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(invalidProperties);
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledOnce;
      expect(editUpdateCommand.validateOptionnalParams).to.have.been.calledWithExactly(
        sinon.match.any,
        ['title', 'description', 'segment', 'properties']
      );
    });
  });

  describe('#execute(program)', () => {

    it('should forward to client if only valid title given', done => {
      // Given
      const response = 'updated !';
      const program = Object.assign({}, minimalProgram, { title });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.editUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(
          token,
          {
            uuid: program.args[0],
            name: title
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to client if only valid description given', done => {
      // Given
      const response = 'updated !';
      const program = Object.assign({}, minimalProgram, { description });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.editUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(
          token,
          {
            uuid: program.args[0],
            description
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error when only invalid segment given', done => {
      // Given
      const error = 'did not found segment';
      const program = Object.assign({}, minimalProgram, { segment });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.reject(error));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segment);
        done();
      });
    });

    it('should forward to client if only valid segment given', done => {
      // Given
      const segmentId = '09876543212345678';
      const response = 'updated !';
      const program = Object.assign({}, minimalProgram, { segment });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.resolve({ id: segmentId }));
      editUpdateCommand.barracks.editUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segment);
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(
          token,
          {
            uuid: program.args[0],
            segmentId
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to client if only valid properties given', done => {
      // Given
      const response = 'updated !';
      const program = Object.assign({}, minimalProgram, { properties });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.editUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(
          token,
          {
            uuid: program.args[0],
            additionalProperties: JSON.parse(properties)
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to client if options given', done => {
      // Given
      const segmentId = '09876543212345678';
      const response = 'updated !';
      const program = Object.assign({}, minimalProgram, {
        title,
        description,
        segment,
        properties
      });
      editUpdateCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editUpdateCommand.barracks.getSegmentByName = sinon.stub().returns(Promise.resolve({ id: segmentId }));
      editUpdateCommand.barracks.editUpdate = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      editUpdateCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editUpdateCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, segment);
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledOnce;
        expect(editUpdateCommand.barracks.editUpdate).to.have.been.calledWithExactly(
          token,
          {
            uuid: program.args[0],
            name: title,
            description,
            segmentId,
            additionalProperties: JSON.parse(properties)
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});