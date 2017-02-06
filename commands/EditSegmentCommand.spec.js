const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const EditSegmentCommand = require('./EditSegmentCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('EditSegmentCommand', () => {

  let editSegmentCommand;
  const token = 'i8uhkj.token.65ryft';
  const savedSegment = {
    id: '12345678',
    name: 'SegmentName',
    userId: '12345',
    query: {
      and: [
        {
          eq: {
            unitId: '1234567890'
          }
        },
        {
          eq: {
            versionId: 'v1'
          }
        }
      ]
    }
  };
  const programWithQuery = {
    id: savedSegment.id,
    query: JSON.stringify(savedSegment.query)
  };
  const programWithAllOptions = {
    id: savedSegment.id,
    name: 'Segmentounette',
    query: JSON.stringify(savedSegment.query)
  };

  before(() => {
    editSegmentCommand = new EditSegmentCommand();
    editSegmentCommand.barracks = {};
    editSegmentCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithAllOptions);

      // When
      const result = editSegmentCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when id is missing', () => {
      // Given
      const program = Object.assign({}, programWithAllOptions, { id: undefined });

      // When
      const result = editSegmentCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when query is not a valid JSON', () => {
      // Given
      const program = Object.assign({}, programWithAllOptions, { query: 'Not { a } json' });

      // When
      const result = editSegmentCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when query is missing', () => {
      // Given
      const program = Object.assign({}, programWithAllOptions, { query: undefined });

      // When
      const result = editSegmentCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return true when name is missing', () => {
      // Given
      const program = Object.assign({}, programWithAllOptions, { name: undefined });

      // When
      const result = editSegmentCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

  });

  describe('#execute(program)', () => {

    it('should return the edited segment when the request is successful and all options are sent', done => {
      // Given
      editSegmentCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editSegmentCommand.barracks = {
        editSegment: sinon.stub().returns(Promise.resolve(savedSegment))
      };

      // When / Then
      editSegmentCommand.execute(programWithAllOptions).then(result => {
        expect(result).to.be.equals(savedSegment);
        expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editSegmentCommand.barracks.editSegment).to.have.been.calledOnce;
        expect(editSegmentCommand.barracks.editSegment).to.have.been.calledWithExactly(token, {
          id: programWithAllOptions.id,
          name: programWithAllOptions.name,
          query: JSON.parse(programWithAllOptions.query)
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the edited segment when the request is successful and name is not sent', done => {
      // Given
      editSegmentCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editSegmentCommand.barracks = {
        editSegment: sinon.stub().returns(Promise.resolve(savedSegment))
      };

      // When / Then
      editSegmentCommand.execute(programWithQuery).then(result => {
        expect(result).to.be.equals(savedSegment);
        expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(editSegmentCommand.barracks.editSegment).to.have.been.calledOnce;
        expect(editSegmentCommand.barracks.editSegment).to.have.been.calledWithExactly(token, {
          id: programWithAllOptions.id,
          query: JSON.parse(programWithAllOptions.query)
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return error when the request failed', done => {
      // Given
      const error = 'Marche pas!!!';
      editSegmentCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      editSegmentCommand.barracks = {
        editSegment: sinon.stub().returns(Promise.reject(error))
      };

      // When / Then
      editSegmentCommand.execute(programWithAllOptions).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error);
          expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledOnce;
          expect(editSegmentCommand.getAuthenticationToken).to.have.been.calledWithExactly();
          expect(editSegmentCommand.barracks.editSegment).to.have.been.calledOnce;
          expect(editSegmentCommand.barracks.editSegment).to.have.been.calledWithExactly(token, {
            id: programWithAllOptions.id,
            name: programWithAllOptions.name,
            query: JSON.parse(programWithAllOptions.query)
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });
});
