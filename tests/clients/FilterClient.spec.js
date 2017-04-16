const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const FilterClient = require('../../src/clients/FilterClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('FilterClient', () => {

  let filterClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    filterClient = new FilterClient();
    filterClient.httpClient = {};
    filterClient.v2Enabled = false;
  });

  describe('#createFilter()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const error = { message: 'Error !' };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterClient.createFilter(token, filter).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createFilterV1', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      });
    });

    it('should return the created filter', done => {
      // Given
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const savedFilter = Object.assign({}, filter, { userId: '123456789' });
      const response = { body: savedFilter };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterClient.createFilter(token, filter).then(result => {
        expect(result).to.be.equals(savedFilter);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createFilterV1', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error message when request fails and v2 flag is enabled', done => {
      // Given
      filterClient.v2Enabled = true;
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const error = { message: 'Error !' };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterClient.createFilter(token, filter).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createFilterV2', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      });
    });

    it('should return the created filter and v2 flag is enabled', done => {
      // Given
      filterClient.v2Enabled = true;
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const savedFilter = Object.assign({}, filter, { userId: '123456789' });
      const response = { body: savedFilter };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterClient.createFilter(token, filter).then(result => {
        expect(result).to.be.equals(savedFilter);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createFilterV2', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getFilter()', () => {

    const filterName = 'myCoolFilter';
    const filter = { name: filterName, query: { eq: { unitId: 'plop' } } };

    it('should return an error if v2Enabled and request fails', done => {
      // Given
      filterClient.v2Enabled = true;
      const error = { message: 'Error !' };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterClient.getFilter(token, filterName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getFilter', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            filter: filterName
          }
        });
        done();
      });
    });

    it('should return specified filter when v2Enabled and request succeeds', done => {
      // Given
      filterClient.v2Enabled = true;
      const response = { body: filter };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterClient.getFilter(token, filterName).then(result => {
        expect(result).to.be.equals(filter);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getFilter', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            filter: filterName
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getFilters()', () => {

    it('should forward to the client with correct headers', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token },
      }
      filterClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      filterClient.getFilters(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(filterClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(filterClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getFiltersV1',
          options,
          'filters'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to the client with correct headers when v2 flag is enabled', done => {
      // Given
      filterClient.v2Enabled = true;
      const options = {
        headers: { 'x-auth-token': token },
      }
      filterClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      filterClient.getFilters(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(filterClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(filterClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getFiltersV2',
          options,
          'filters'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#deleteFilter()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const name = 'aFilter';
      const error = { message: 'Error !' };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterClient.deleteFilter(token, name).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('deleteFilterV1', {
          headers: { 'x-auth-token': token },
          pathVariables: { filter: name }
        });
        done();
      });
    });

    it('should return nothing when filter is deleted', done => {
      // Given
      const name = 'aFilter';
      const response = { body: undefined };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterClient.deleteFilter(token, name).then(result => {
        expect(result).to.be.equals(undefined);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('deleteFilterV1', {
          headers: { 'x-auth-token': token },
          pathVariables: { filter: name }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error message when request fails and v2 flag is enabled', done => {
      // Given
      filterClient.v2Enabled = true;
      const name = 'aFilter';
      const error = { message: 'Error !' };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterClient.deleteFilter(token, name).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('deleteFilterV2', {
          headers: { 'x-auth-token': token },
          pathVariables: { filter: name }
        });
        done();
      });
    });

    it('should return nothing when filter is deleted and v2 flag is enabled', done => {
      // Given
      filterClient.v2Enabled = true;
      const name = 'aFilter';
      const response = { body: undefined };
      filterClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterClient.deleteFilter(token, name).then(result => {
        expect(result).to.be.equals(undefined);
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(filterClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('deleteFilterV2', {
          headers: { 'x-auth-token': token },
          pathVariables: { filter: name }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});