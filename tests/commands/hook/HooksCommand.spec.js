const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const HooksCommand = require('../../../src/commands/hook/HooksCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('hooksCommand', () => {

  let hooksCommand;
  const token = 'i8uhkj.token.65ryft';

  before(() => {
    hooksCommand = new HooksCommand();
    hooksCommand.barracks = {};
    hooksCommand.userConfiguration = {};
  });

  describe('#execute()', () => {

    it('should forward request to barracks client', done => {
      // Given
      const response = [];
      hooksCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      hooksCommand.barracks.getHooks = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      hooksCommand.execute().then(result => {
        expect(result).to.be.equals(response);
        expect(hooksCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(hooksCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(hooksCommand.barracks.getHooks).to.have.been.calledOnce;
        expect(hooksCommand.barracks.getHooks).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});