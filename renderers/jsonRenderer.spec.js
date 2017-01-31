const chai = require('chai');
const PageableStream = require('../clients/PageableStream');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const jsonRenderer = require('./jsonRenderer');

chai.use(chaiAsPromised);
chai.use(sinonChai);

function getRenderedJson(spy) {
  let i = 0;
  let value = '';
  for (; i < spy.callCount; i++) {
    value += spy.args[i][0];
  }
  console.log(value)
  return JSON.parse(value);
}

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

  it('should print what is send through the stream when it is a PageableStream', done => {
    // Given
    const chunk1 = [{ prop: 'value1' }];
    const chunk2 = [{ prop: 'value2' }];
    const stream = new PageableStream();
    const promise = Promise.resolve(stream);
    const log = console.log;
    console.log = sinon.spy();

    // When / Then
    jsonRenderer(promise).then(() => {
      stream.write(chunk1);
      stream.write(chunk2);
      stream.lastPage();
      const spy = console.log;
      console.log = log;
      expect(getRenderedJson(spy)).to.be.deep.equal([].concat(chunk1, chunk2));
      done();
    }).catch(err => {
      console.log = log;
      done(err);
    });
  });

});
