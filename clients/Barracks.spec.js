const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const Barracks = require('./Barracks');
const PageableStream = require('../clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Barracks', () => {

  let barracks;
  const token = 'i8uhkj.token.65ryft';

  describe('#authenticate()', () => {

    before(() => {
      barracks = new Barracks();
    });

    it('', (done) => {
      // Given
      const username = 'john@doe.fr';
      const password = 'PaSsWoRd';

      // When
      const result = barracks.authenticate();

      // Then
      
    });

  });

});