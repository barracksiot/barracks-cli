const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const ListenMessagesCommand = require('../../../src/commands/message/ListenMessagesCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ListenMessagesCommand', () => {

  let listenMessagesCommand;
  const token = '89zer4568.token.z8s4f25';
  const unitId = 'unitId51478a657z2';
  const timeout = 60000;

  const validProgram = {
    unitId: unitId,
    timeout: timeout
  };

  before(() => {
    listenMessagesCommand = new ListenMessagesCommand();
    listenMessagesCommand.barracks = {};
    listenMessagesCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = listenMessagesCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when empty unitId option given', () => {
      // Given
      const program = Object.assign({}, validProgram, { unitId: true });
      // When
      const result = listenMessagesCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when unitId option is given', () => {
      // Given
      const program = validProgram;
      // When
      const result = listenMessagesCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    const apiKey = 'apiKey';
    it('should forward to barracks client when valid unitId and timeout are given', done => {
      // Given
      const program = validProgram;
      const message = 'a message';
      const account = { apiKey: apiKey, username: 'coucou' };
      const response = {
        id: 'aMessageId',
        unitId: unitId,
        message: message
      };
      listenMessagesCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      listenMessagesCommand.barracks.listenMessages = sinon.stub().returns(Promise.resolve(response));
      listenMessagesCommand.barracks.getAccount = sinon.stub().returns(Promise.resolve(account));
      // When / Then
      listenMessagesCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(listenMessagesCommand.barracks.listenMessages).to.have.been.calledOnce;
        expect(listenMessagesCommand.barracks.listenMessages).to.have.been.calledWithExactly(
          apiKey, unitId, timeout
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});