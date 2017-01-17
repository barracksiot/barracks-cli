const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const PageableStream = require('./PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);


describe('PageableStream', () => {

  let pageableStream;
  let stdin;

  describe('#onPageReceived()', () => {

    before(() => {
      pageableStream = new PageableStream();
    });
  
    it('should execute the callback when event received', () => {
      // Given
      const response = { data: 'Ok cool' };
      const callback = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      pageableStream.onPageReceived(callback);
      expect(callback).to.have.been.calledOnce;
    });
  });
});