const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const PageableStream = require('../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

let requestMock;
let client;

const baseUrl = 'http://barracks.io/';

describe('HTTPClient', () => {

  beforeEach(() => {
    const HTTPClient = proxyquire('../../src/clients/HTTPClient', {
      'request-promise': (options) => {
        return requestMock(options);
      }
    });

    client = new HTTPClient();
  });

  describe('#buildEndpointUri()', () => {

    it('should return the endpoint url when no path params given', () => {
      // Given
      const endpoint = 'test';
      const options = {};
      client.serverInfo = {
        baseUrl,
        endpoints: {
          test: { path: 'test/endpoint' }
        }
      };

      // When
      const result = client.buildEndpointUri(endpoint, options);

      // Then
      const expectedResult = baseUrl + client.serverInfo.endpoints[endpoint].path;
      expect(result).to.be.equals(expectedResult);
    });

    it('should return the endpoint url when one path params given', () => {
      // Given
      const endpoint = 'test';
      const paramValue = 'anId';
      const options = { pathVariables: { param: paramValue } };
      client.serverInfo = {
        baseUrl,
        endpoints: {
          test: { path: 'test/endpoint/:param' }
        }
      };

      // When
      const result = client.buildEndpointUri(endpoint, options);

      // Then
      const expectedResult = baseUrl + 'test/endpoint/' + paramValue;
      expect(result).to.be.equals(expectedResult);
    });

    it('should return the endpoint url when multiple path params given', () => {
      // Given
      const endpoint = 'test';
      const paramValue = 'anId';
      const otherParamValue = 'aValue'
      const options = { pathVariables: {
        param: paramValue,
        otherParam: otherParamValue
      }};
      client.serverInfo = {
        baseUrl,
        endpoints: {
          test: { path: 'test/endpoint/:param/truc/:otherParam' }
        }
      };

      // When
      const result = client.buildEndpointUri(endpoint, options);

      // Then
      const expectedResult = baseUrl + 'test/endpoint/' + paramValue + '/truc/' + otherParamValue;
      expect(result).to.be.equals(expectedResult);
    });
  });

  describe('#sendEndpointRequest()', () => {

    it('should return request response', () => {
      // Given
      const endpoint = 'test';
      const endpointUri = baseUrl + 'endpoint';
      const method = 'POST';
      const options = { headers: { 'x-auth-token': 'token' } };
      client.buildEndpointUri = sinon.stub().returns(endpointUri);
      client.serverInfo = {
        baseUrl,
        endpoints: {
          test: {
            path: 'endpoint',
            method
          }
        }
      };
      const response = { status: 200, body: 'coucou' };
      requestMock = sinon.stub().returns(response);

      // When
      const result = client.sendEndpointRequest(endpoint, options);

      // Then
      expect(result).to.be.equals(response);
      expect(client.buildEndpointUri).to.have.been.calledOnce;
      expect(client.buildEndpointUri).to.have.been.calledWithExactly(endpoint, options);
      expect(requestMock).to.have.been.calledOnce;
      expect(requestMock).to.have.been.calledWithExactly(Object.assign({}, {
        method,
        uri: endpointUri,
        json: true,
        resolveWithFullResponse: true
      }, options));
    });
  });

  describe('#retrievePagesUntilCondition()', () => {

    it('should delegate to retrieveNextPages', () => {
      // Given
      const stream = new PageableStream();
      const endpoint = 'test';
      const endpointUri = baseUrl + 'endpoint';
      const options = { headers: { 'x-auth-token': 'token' } };
      const embeddedKey = 'key';
      const stopCondition = sinon.spy();
      client.buildEndpointUri = sinon.stub().returns(endpointUri);
      client.retrieveNextPages = sinon.spy();

      // When
      client.retrievePagesUntilCondition(stream, endpoint, options, embeddedKey, stopCondition);

      // Then
      expect(client.buildEndpointUri).to.have.been.calledOnce;
      expect(client.buildEndpointUri).to.have.been.calledWithExactly(endpoint, options);
      expect(client.retrieveNextPages).to.have.been.calledOnce;
      expect(client.retrieveNextPages).to.have.been.calledWithExactly(
        stream,
        endpointUri,
        options,
        embeddedKey,
        stopCondition
      );
    });
  });

  describe('#retrieveAllPages()', () => {

    it('should delegate to retrieveNextPages', () => {
      // Given
      const stream = new PageableStream();
      const endpoint = 'test';
      const endpointUri = baseUrl + 'endpoint';
      const options = { headers: { 'x-auth-token': 'token' } };
      const embeddedKey = 'key';
      client.buildEndpointUri = sinon.stub().returns(endpointUri);
      client.retrieveNextPages = sinon.spy();

      // When
      client.retrieveAllPages(stream, endpoint, options, embeddedKey);

      // Then
      expect(client.buildEndpointUri).to.have.been.calledOnce;
      expect(client.buildEndpointUri).to.have.been.calledWithExactly(endpoint, options);
      expect(client.retrieveNextPages).to.have.been.calledOnce;
      expect(client.retrieveNextPages).to.have.been.calledWithExactly(
        stream,
        endpointUri,
        options,
        embeddedKey
      );
    });
  });

  describe('#retrieveNextPages()', () => {

    it('should delegate to handlePage when serveur response is a page', (done) => {
      // Given
      const stream = new PageableStream();
      const endpointUri = baseUrl + 'endpoint';
      const options = { headers: { 'x-auth-token': 'token' } };
      const embeddedKey = 'key';
      const stopCondition = sinon.spy();
      client.handlePage = sinon.spy();
      const response = { body: { _embedded: { [embeddedKey]: 'coucou' }}};
      requestMock = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      client.retrieveNextPages(stream, endpointUri, options, embeddedKey, stopCondition).then(() => {
        expect(requestMock).to.have.been.calledOnce;
        expect(requestMock).to.have.been.calledWithExactly(Object.assign({}, {
          method: 'GET',
          uri: endpointUri,
          json: true,
          resolveWithFullResponse: true
        }, options));
        expect(client.handlePage).to.have.been.calledOnce;
        expect(client.handlePage).to.have.been.calledWithExactly(
          stream,
          response.body,
          options,
          embeddedKey,
          stopCondition
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should send lastPage event to the stream when server respond with last page', (done) => {
      // Given
      const stream = new PageableStream();
      const lastPageCallback = sinon.spy();
      stream.onLastPage(lastPageCallback);
      const endpointUri = baseUrl + 'endpoint';
      const options = { headers: { 'x-auth-token': 'token' } };
      const embeddedKey = 'key';
      const stopCondition = sinon.spy();
      const response = { body: 'coucou' };
      requestMock = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      client.retrieveNextPages(stream, endpointUri, options, embeddedKey, stopCondition).then(() => {
        expect(requestMock).to.have.been.calledOnce;
        expect(requestMock).to.have.been.calledWithExactly(Object.assign({}, {
          method: 'GET',
          uri: endpointUri,
          json: true,
          resolveWithFullResponse: true
        }, options));
        expect(lastPageCallback).to.have.been.calledOnce;
        expect(lastPageCallback).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should send fail event to the stream when server respond with an error', (done) => {
      // Given
      const stream = new PageableStream();
      const onErrorCallback = sinon.spy();
      stream.onError(onErrorCallback);
      const endpointUri = baseUrl + 'endpoint';
      const options = { headers: { 'x-auth-token': 'token' } };
      const embeddedKey = 'key';
      const stopCondition = sinon.spy();
      client.handlePage = sinon.spy();
      const error = 'error'
      requestMock = sinon.stub().returns(Promise.reject(error));

      // When / Then
      client.retrieveNextPages(stream, endpointUri, options, embeddedKey, stopCondition).then(() => {
        expect(requestMock).to.have.been.calledOnce;
        expect(requestMock).to.have.been.calledWithExactly(Object.assign({}, {
          method: 'GET',
          uri: endpointUri,
          json: true,
          resolveWithFullResponse: true
        }, options));
        expect(onErrorCallback).to.have.been.calledOnce;
        expect(onErrorCallback).to.have.been.calledWithExactly(error);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#handlePage()', () => {

    it('should load next page if one exists and no stop condition given', () => {
      // Given
      const stream = new PageableStream();
      const onPageReceivedCallback = sinon.spy();
      stream.onPageReceived(onPageReceivedCallback);
      const embeddedKey = 'key';
      const pageData = [ 'value1', 'value2' ];
      const nextPageLink = 'link/to/next/page';
      const page = {
        _embedded: { [embeddedKey]: pageData },
        _links: { next: { href: nextPageLink } }
      };
      const options = { headers: { 'x-auth-token': 'token' } };
      client.retrieveNextPages = sinon.spy();

      // When
      client.handlePage(stream, page, options, embeddedKey);

      // Then
      expect(onPageReceivedCallback).to.have.been.calledOnce;
      expect(onPageReceivedCallback).to.have.been.calledWithExactly(pageData);
      expect(client.retrieveNextPages).to.have.been.calledOnce;
      expect(client.retrieveNextPages).to.have.been.calledWithExactly(
        stream,
        nextPageLink,
        options,
        embeddedKey,
        undefined
      );
    });

    it('should load next page if one exists and stop condition given is false', () => {
      // Given
      const stream = new PageableStream();
      const onPageReceivedCallback = sinon.spy();
      stream.onPageReceived(onPageReceivedCallback);
      const embeddedKey = 'key';
      const pageData = [ 'value1', 'value2' ];
      const nextPageLink = 'link/to/next/page';
      const page = {
        _embedded: { [embeddedKey]: pageData },
        _links: { next: { href: nextPageLink } }
      };
      const options = { headers: { 'x-auth-token': 'token' } };
      client.retrieveNextPages = sinon.spy();
      const stopCondition = sinon.stub().returns(false);

      // When
      client.handlePage(stream, page, options, embeddedKey, stopCondition);

      // Then
      expect(onPageReceivedCallback).to.have.been.calledOnce;
      expect(onPageReceivedCallback).to.have.been.calledWithExactly(pageData);
      expect(stopCondition).to.have.been.calledOnce;
      expect(stopCondition).to.have.been.calledWithExactly(pageData);
      expect(client.retrieveNextPages).to.have.been.calledOnce;
      expect(client.retrieveNextPages).to.have.been.calledWithExactly(
        stream,
        nextPageLink,
        options,
        embeddedKey,
        stopCondition
      );
    });

    it('should send lastPage event to the stream if stop condition is true', () => {
      // Given
      const stream = new PageableStream();
      const lastPageCallback = sinon.spy();
      const onPageReceivedCallback = sinon.spy();
      stream.onLastPage(lastPageCallback);
      stream.onPageReceived(onPageReceivedCallback);
      const embeddedKey = 'key';
      const pageData = [ 'value1', 'value2' ];
      const nextPageLink = 'link/to/next/page';
      const page = {
        _embedded: { [embeddedKey]: pageData },
        _links: { next: { href: nextPageLink } }
      };
      const options = { headers: { 'x-auth-token': 'token' } };
      const stopCondition = sinon.stub().returns(true);

      // When
      client.handlePage(stream, page, options, embeddedKey, stopCondition);

      // Then
      expect(onPageReceivedCallback).to.have.been.calledOnce;
      expect(onPageReceivedCallback).to.have.been.calledWithExactly(pageData);
      expect(stopCondition).to.have.been.calledOnce;
      expect(stopCondition).to.have.been.calledWithExactly(pageData);
      expect(lastPageCallback).to.have.been.calledOnce;
      expect(lastPageCallback).to.have.been.calledWithExactly();
    });

    it('should send lastPage event to the stream if no next page available', () => {
      // Given
      const stream = new PageableStream();
      const lastPageCallback = sinon.spy();
      const onPageReceivedCallback = sinon.spy();
      stream.onLastPage(lastPageCallback);
      stream.onPageReceived(onPageReceivedCallback);
      const embeddedKey = 'key';
      const pageData = [ 'value1', 'value2' ];
      const nextPageLink = 'link/to/next/page';
      const page = {
        _embedded: { [embeddedKey]: pageData },
        _links: {}
      };
      const options = { headers: { 'x-auth-token': 'token' } };

      // When
      client.handlePage(stream, page, options, embeddedKey);

      // Then
      expect(onPageReceivedCallback).to.have.been.calledOnce;
      expect(onPageReceivedCallback).to.have.been.calledWithExactly(pageData);
      expect(lastPageCallback).to.have.been.calledOnce;
      expect(lastPageCallback).to.have.been.calledWithExactly();
    });
  });
});
