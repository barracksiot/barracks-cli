const PageableStream = require('../../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const FilterCommand = require('../../../src/commands/filter/FilterCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('filterCommand', () => {

  let filterCommand;
  const token = 'ze65r841u.token.nbag632f';
  const programWithValidOptions = {
    args: ['filterNameTest']
  };

  before(() => {
    filterCommand = new FilterCommand();
    filterCommand.barracks = {};
    filterCommand.userConfiguration = {};
  });

  describe('#validateCommand(program)', () => {

    it('should return false when unit id is missing', () => {
      // Given
      const program = {};

      // When
      const result = filterCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
    });

    it('should return true when filter name is given', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = filterCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });
  });

  describe('#execute(program)', () => {

    it('should return an error when the client request fails', done => {
      // Given
      const error = 'error';
      const program = programWithValidOptions;
      filterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      filterCommand.barracks.getFilter = sinon.stub().returns(Promise.reject(error));

      // When / Then
      filterCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(filterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(filterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(filterCommand.barracks.getFilter).to.have.been.calledOnce;
        expect(filterCommand.barracks.getFilter).to.have.been.calledWithExactly(token, programWithValidOptions.args[0]);
        done();
      });
    });

    it('should forward the client response when everything is ok', done => {
      // Given
      const response = ['myFilter'];
      const program = programWithValidOptions;
      filterCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      filterCommand.barracks.getFilter = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filterCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(filterCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(filterCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(filterCommand.barracks.getFilter).to.have.been.calledOnce;
        expect(filterCommand.barracks.getFilter).to.have.been.calledWithExactly(token, programWithValidOptions.args[0]);
        done();
      }).catch(err => {
        done(err);
      });
    });
  })
})