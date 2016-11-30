const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const jsonRenderer = require('./jsonRenderer');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('jsonRenderer', () => {

  it('should print a stringified JSON of the resolved result when it is not a PageableStream', done => {
    // Given
    const object = {
      prop: 'value'
    };
    const promise = Promise.resolve(object);
    const log = console.log;
    console.log = sinon.spy();

    // When / Then
    jsonRenderer(promise).then(() => {
      const spy = console.log;
      console.log = log;
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWithExactly(JSON.stringify(object));
      done();
    }).catch(err => {
      console.log = log;
      done(err);
    });
  });

  it('should print the error message of the rejected result', done => {
    // Given
    const error = 'Error';
    const promise = Promise.reject(error);
    const log = console.error;
    console.error = sinon.spy();

    // When / Then
    jsonRenderer(promise).then(() => {
      const spy = console.error;
      console.error = log;
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWithExactly(error);
      done();
    }).catch(err => {
      console.error = log;
      done(err);
    });
  });

});