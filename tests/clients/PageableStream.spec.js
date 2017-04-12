const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const PageableStream = require('../../src/clients/PageableStream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('PageableStream', () => {

  let pageableStream;
  let stdin;

  describe('#onPageReceived()', () => {

    before(() => {
      pageableStream = new PageableStream();
    });
  
    it('should execute the callback when write event received', () => {
      // Given
      const page = { data: 'Ok cool' };
      const callback = sinon.stub().returns(Promise.resolve());

      // When / Then
      pageableStream.onPageReceived(callback);
      pageableStream.write(page);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly(page);
    });
  });

  describe('#onError()', () => {

    before(() => {
      pageableStream = new PageableStream();
    });
  
    it('should execute the callback when error event received', () => {
      // Given
      const error = { data: 'Ok pas cool' };
      const callback = sinon.stub().returns(Promise.resolve());

      // When / Then
      pageableStream.onError(callback);
      pageableStream.fail(error);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly(error);
    });
  });

  describe('#onLastPage()', () => {

    before(() => {
      pageableStream = new PageableStream();
    });
  
    it('should execute the callback when lastPage event received', () => {
      // Given
      const callback = sinon.stub().returns(Promise.resolve());

      // When / Then
      pageableStream.onLastPage(callback);
      pageableStream.lastPage();
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly();
    });
  });
});