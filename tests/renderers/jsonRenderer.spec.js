const chai = require('chai');
const PageableStream = require('../../src/clients/PageableStream');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const jsonRenderer = require('../../src/renderers/jsonRenderer');

chai.use(chaiAsPromised);
chai.use(sinonChai);

function getRenderedJson(spy) {
  let i = 0;
  let value = '';
  for (; i < spy.callCount; i++) {
    value += spy.args[i][0];
  }
  return JSON.parse(value);
}

describe('jsonRenderer', () => {

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = sinon.spy();
    consoleErrorSpy = sinon.spy();
    console.log = (data) => {
      consoleLogSpy(data);
      originalConsoleLog(data);
    };
    console.error = (data) => {
      consoleErrorSpy(data);
      originalConsoleError(data);
    };
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should print a stringified JSON of the resolved result when it is not a PageableStream', done => {
    // Given
    const object = {
      prop: 'value'
    };
    const promise = Promise.resolve(object);

    // When / Then
    jsonRenderer(promise).then(() => {
      expect(consoleLogSpy).to.have.been.calledOnce;
      expect(consoleLogSpy).to.have.been.calledWithExactly(JSON.stringify(object));
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should print the error message AS a JSON of the rejected result', done => {
    // Given
    const error = 'Error';
    const promise = Promise.reject(error);

    // When / Then
    jsonRenderer(promise).then(() => {
      done('Should have failed');
    }).catch(err => {
      expect(consoleErrorSpy).to.have.been.calledOnce;
      expect(consoleErrorSpy).to.have.been.calledWithExactly(JSON.stringify({ error }));
      done();
    });
  });

  it('should print what is send through the stream when it is a PageableStream', done => {
    // Given
    const chunk1 = [{ prop: 'value1' }];
    const chunk2 = [{ prop: 'value2' }];
    const stream = new PageableStream();
    const promise = Promise.resolve(stream);

    // When / Then
    jsonRenderer(promise).then(() => {
      stream.write(chunk1);
      stream.write(chunk2);
      stream.lastPage();
      expect(getRenderedJson(consoleLogSpy)).to.be.deep.equal([].concat(chunk1, chunk2));
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should resolve and display nothing if result is undefined', done => {
    // Given
    const promise = Promise.resolve();

    // When / Then
    jsonRenderer(promise).then(() => {
      expect(consoleLogSpy).to.not.have.been.calledOnce;
      done();
    }).catch(err => {
      done(err);
    });
  });
});
