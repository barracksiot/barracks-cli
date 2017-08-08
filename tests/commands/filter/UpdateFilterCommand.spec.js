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
  let proxyAsk;

  const UpdateFilterCommand = proxyquire('../../../src/commands/filter/UpdateFilterCommand', {
    '../../utils/Validator': {
      isJsonObject: (str) => {
        return proxyIsJsonObject(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    },
    'yesno': {
      ask: (str, boolean, callback) => {
        return proxyAsk(str, boolean, callback);
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

  const programWithValidOptions2 = {
    name: 'FilterName2',
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
  const updatedFilter2 = {
    name: 'FilterName2',
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
    proxyAsk = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return true;
      };

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

    const filter = {
      name: 'filterName',
      query: '{"eq": { "customClientData": { "key": "value" } } }',
      deviceCount: 0,
      deploymentCount: 0
    };

    const filterUsed = {
      name: 'filterName2',
      query: '{"eq": { "customClientData": { "key2": "value2" } } }',
      deviceCount: 2,
      deploymentCount: 0
    };

    it('should return the updated filter when filter is not used', done => {
      // Given
      updateFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateFilterCommand.confirmUpdate = sinon.stub().returns(Promise.resolve(true));
      updateFilterCommand.barracks = {
        updateFilter: sinon.stub().returns(Promise.resolve(updatedFilter)),
        getFilter:  sinon.stub().returns(Promise.resolve(filter))
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

    it('should return the updated filter when filter is used and user agrees', done => {
      // Given
      const spyOnAsk = sinon.spy();
      proxyAsk = (str, boolean, callback) => {
        spyOnAsk(str, boolean, callback);
        callback('ok');
      };

      updateFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateFilterCommand.barracks = {
        updateFilter: sinon.stub().returns(Promise.resolve(updatedFilter2)),
        getFilter:  sinon.stub().returns(Promise.resolve(filterUsed))
      };

      // When / Then
      updateFilterCommand.execute(programWithValidOptions2).then(result => {
        expect(result).to.be.equals(updatedFilter2);
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledOnce;
        expect(updateFilterCommand.barracks.updateFilter).to.have.been.calledWithExactly(token, {
          name: programWithValidOptions2.name,
          query: JSON.parse(programWithValidOptions2.query)
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should abort when filter is used and user disagrees', done => {
      // Given
      const spyOnAsk = sinon.spy();
      proxyAsk = (str, boolean, callback) => {
        spyOnAsk(str, boolean, callback);
        callback();
      };

      updateFilterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      updateFilterCommand.barracks = {
        updateFilter: sinon.stub().returns(Promise.resolve(updatedFilter2)),
        getFilter:  sinon.stub().returns(Promise.resolve(filterUsed))
      };

      // When / Then
      updateFilterCommand.execute(programWithValidOptions2).then(result => {
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(updateFilterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(updateFilterCommand.barracks.updateFilter).to.have.not.been.calledOnce;
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
        updateFilter: sinon.stub().returns(Promise.reject(error)),
        getFilter: sinon.stub().returns(Promise.resolve(filter))
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
