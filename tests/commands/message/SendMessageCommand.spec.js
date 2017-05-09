const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const SendMessageCommand = require('../../../src/commands/message/SendMessageCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('SendMessageCommand', () => {

  let sendMessageCommand;
  const token = '89zer4568.token.z8s4f25';
  const unitId = 'unitId51478a657z2';
  const message = 'Hello Mr.Device, how are you doing ?';

  const validProgram = {
    device: unitId,
    message: message
  };

  before(() => {
    sendMessageCommand = new SendMessageCommand();
    sendMessageCommand.barracks = {};
    sendMessageCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only device option given', () => {
      // Given
      const program = { device: unitId };
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only message option given', () => {
      // Given
      const program = { message: message };
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty device option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { device: true });
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty message option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { message: true });
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when both device and message options given', () => {
      // Given
      const program = validProgram;
      // When
      const result = sendMessageCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  })

  describe('#execute(program)', () => {

    it('should forward to barracks client when valid device and message are given', done => {
      // Given
      const program = validProgram;
      const response = {
        id: 'aMessageId',
        device: unitId,
        message: message
      };
      sendMessageCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      sendMessageCommand.barracks.sendMessage = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      sendMessageCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(sendMessageCommand.barracks.sendMessage).to.have.been.calledOnce;
        expect(sendMessageCommand.barracks.sendMessage).to.have.been.calledWithExactly(
          token,
          {
            device: unitId,
            message: message
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
})