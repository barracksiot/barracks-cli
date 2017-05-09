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
    const messageContent = 'messageInABottle';
    const message = {
      target: unitId,
      message: messageContent
    }

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
            path: '/v2/api/member/messages/send/:unitId'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { unitId },
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
      messageClient.sendMessage(token, message).then(result => {
        expect(result).to.be.equals(message.message);
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(messageClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly(
          {
            method: 'POST',
            path: '/v2/api/member/messages/send/:unitId'
          },
          {
            headers: { 'x-auth-token': token },
            pathVariables: { unitId },
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