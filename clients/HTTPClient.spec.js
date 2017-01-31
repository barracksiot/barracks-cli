const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const proxyquire = require('proxyquire').noCallThru();
const PageableStream = require('./PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

let requestMock;
let client;

const baseUrl = 'http://barracks.io/';


describe('HTTPClient', () => {

  beforeEach(() => {
    const HTTPClient = proxyquire('./HTTPClient', {
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
      const stopCondition = () => { return true; }
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
      const stopCondition = () => { return true; }
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
  });
/*

  describe('#handlePage()', () => {
  });
  */
});
