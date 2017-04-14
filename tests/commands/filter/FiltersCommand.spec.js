const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const FiltersCommand = require('../../../src/commands/filter/FiltersCommand');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('FiltersCommand', () => {

  let filtersCommand;
  const token = 'i8uhkj.token.65ryft';

  before(() => {
    filtersCommand = new FiltersCommand();
    filtersCommand.barracks = {};
    filtersCommand.userConfiguration = {};
  });

  describe('#execute()', () => {

    it('should forward request to barracks client', done => {
      // Given
      const response = [];
      filtersCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      filtersCommand.barracks.getFilters = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      filtersCommand.execute().then(result => {
        expect(result).to.be.equals(response);
        expect(filtersCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(filtersCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(filtersCommand.barracks.getFilters).to.have.been.calledOnce;
        expect(filtersCommand.barracks.getFilters).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});