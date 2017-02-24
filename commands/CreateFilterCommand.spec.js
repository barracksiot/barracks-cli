const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const CreateFilterCommand = require('./CreateFilterCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateFilterCommand', () => {

  let createFilterCommand;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    name: 'FilterName',
    query: JSON.stringify({
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
    })
  };
  const createdFilter = {
    name: 'FilterName',
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

  before(() => {
    createFilterCommand = new CreateFilterCommand();
    createFilterCommand.barracks = {};
    createFilterCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = createFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when name is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { name: undefined });

      // When
      const result = createFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when name is function', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { name: () => { return 'plop'; } });

      // When
      const result = createFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when query is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { query: undefined });

      // When
      const result = createFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return false when query is not a valid JSON', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { query: 'Not { a } json' });

      // When
      const result = createFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

  });

  describe('#execute(program)', () => {

    it('should return the created filter when the request was successful', done => {
      // Given
      createFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createFilterCommand.barracks = {
        createFilter: sinon.stub().returns(Promise.resolve(createdFilter))
      };

      // When / Then
      createFilterCommand.execute(programWithValidOptions).then(result => {
        expect(result).to.be.equals(createdFilter);
        expect(createFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createFilterCommand.barracks.createFilter).to.have.been.calledOnce;
        expect(createFilterCommand.barracks.createFilter).to.have.been.calledWithExactly(token, {
          name: programWithValidOptions.name,
          query: JSON.parse(programWithValidOptions.query)
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return error when the request failed', done => {
      // Given
      const error = 'Marche pas!!!';
      createFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createFilterCommand.barracks = {
        createFilter: sinon.stub().returns(Promise.reject(error))
      };

      // When / Then
      createFilterCommand.execute(programWithValidOptions).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error);
          expect(createFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
          expect(createFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
          expect(createFilterCommand.barracks.createFilter).to.have.been.calledOnce;
          expect(createFilterCommand.barracks.createFilter).to.have.been.calledWithExactly(token, {
            name: programWithValidOptions.name,
            query: JSON.parse(programWithValidOptions.query)
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });
});
