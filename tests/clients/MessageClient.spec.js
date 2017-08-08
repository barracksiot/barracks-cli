const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const MessageClient = require('../../src/clients/MessageClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('MessageClient', () => {

  let messageClient;
  const token = 'z35ze9d.token.pro5g87';

  beforeEach(() => {
    messageClient = new MessageClient();
    messageClient.httpClient = {};
    messageClient.v2Enabled = true;
  });

  describe('#sendMessage()', () => {

    const unitId = 'aShortUnitId';
    const filter = 'superfilter';
    const messageContent = 'messageInABottle';
    const retained = 'true';
    const message = {
      unitId,
      filter,
      message: messageContent,
      retained
    }

    const messageNoFilter = {
      unitId,
      message: messageContent,
      retained
    };
    const messageNoUnitId = {
      filter,
      message: messageContent,
      retained
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      messageClient.sendMessage(token, message).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'unitId=' + message.unitId + '&filter=' + message.filter + '&retained=' + message.retained},
            body: message.message
          }
        );
        done();
      });
    });

    it('should return an error message when request fails and should use empty string instead of undefined when no filter provided', done => {
      // Given
      const error = { message: 'Error !' };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      messageClient.sendMessage(token, messageNoFilter).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'unitId=' + messageNoFilter.unitId + '&filter=' + '&retained=' + message.retained},
            body: messageNoFilter.message
          }
        );
        done();
      });
    });

    it('should return the message sent when request succeeds', done => {
      // Given
      const response = { body: message.message };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      messageClient.sendMessage(token, message).then(result => {
        expect(result).to.be.equals(message.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'unitId=' + message.unitId + '&filter=' + message.filter + '&retained=' + message.retained},
            body: message.message
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the message sent when request succeeds and should use empty string instead of undefined when no unitId provided', done => {
      // Given
      const response = { body: messageNoUnitId.message };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      messageClient.sendMessage(token, messageNoUnitId).then(result => {
        expect(result).to.be.equals(messageNoUnitId.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'unitId=' + '&filter=' + messageNoUnitId.filter + '&retained=' + message.retained},
            body: messageNoUnitId.message
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#sendMessageToAll()', () => {

    const messageContent = 'messageInABottle';
    const message = {
      message: messageContent
    }

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      messageClient.sendMessageToAll(token, message).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'retained=' + (message.retained || 'false')},
            body: message.message
          }
        );
        done();
      });
    });

    it('should return the message sent when request succeeds', done => {
      // Given
      const response = { body: message.message };
      messageClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      messageClient.sendMessageToAll(token, message).then(result => {
        expect(result).to.be.equals(message.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/api/messaging/messages?:query'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { query: 'retained=' + (message.retained || 'false')},
            body: message.message
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});