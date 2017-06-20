const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UpdateFilterCommand', () => {

  let updateFilterCommand;
  let proxyIsJsonObject;
  let proxyFileExists;

  const UpdateFilterCommand = proxyquire('../../../src/commands/filter/UpdateFilterCommand', {
    '../../utils/Validator': {
      isJsonObject: (str) => {
        return proxyIsJsonObject(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }
  });

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
  const updatedFilter = {
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
    updateFilterCommand = new UpdateFilterCommand();
    updateFilterCommand.barracks = {};
    updateFilterCommand.userConfiguration = {};
    proxyIsJsonObject = undefined;
    proxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return true;
      }

      // When
      const result = updateFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(programWithValidOptions.query);
    });

    it('should return false when name is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { name: undefined });
      // When
      const result = updateFilterCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when query is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { query: undefined });
      // When
      const result = updateFilterCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when query is not a valid JSON', () => {
      // Given
      const query = 'Not { a } json';
      const program = Object.assign({}, programWithValidOptions, { query });
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return false;
      }

      // When
      const result = updateFilterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(query);
    });

  });

  describe('#execute(program)', () => {

    it('should return the updated filter when the request was successful', done => {
      // Given
      updateFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateFilterCommand.barracks = {
        updateFilter: sinon.stub().returns(Promise.resolve(updatedFilter))
      };

      // When / Then
      updateFilterCommand.execute(programWithValidOptions).then(result => {
        expect(result).to.be.equals(updatedFilter);
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledOnce;
        expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledWithExactly(token, {
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
      updateFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateFilterCommand.barracks = {
        updateFilter: sinon.stub().returns(Promise.reject(error))
      };

      // When / Then
      updateFilterCommand.execute(programWithValidOptions).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error);
          expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
          expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
          expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledOnce;
          expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledWithExactly(token, {
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
