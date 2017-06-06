const chai = require('chai');
const PageableStream = require('../../src/clients/PageableStream');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const prettyRenderer = require('../../src/renderers/prettyRenderer');
const prettyjson = require('prettyjson');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('prettyRenderer', () => {

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalPrettyRender = prettyjson.render;
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
    prettyjson.render = originalPrettyRender;
  });

  it('should build a string with prettyjson and render it with console.log', done => {
    // Given
    const object = { prop: 'value' };
    const prettyString = '- prop: value';
    const promise = Promise.resolve(object);
    prettyjson.render = sinon.stub().returns(prettyString);

    // When / Then
    prettyRenderer(promise).then(() => {
      expect(prettyjson.render).to.have.been.calledOnce;
      expect(prettyjson.render).to.have.been.calledWithExactly(object);
      expect(consoleLogSpy).to.have.been.calledOnce;
      expect(consoleLogSpy).to.have.been.calledWithExactly(prettyString);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should print the error message of the rejected result', done => {
    // Given
    const error = 'Error';
    const promise = Promise.reject(error);
    prettyjson.render = sinon.spy();
    
    // When / Then
    prettyRenderer(promise).then(() => {
      done('Should have failed');
    }).catch(err => {
      expect(prettyjson.render).to.have.not.been.called;
      expect(consoleErrorSpy).to.have.been.calledOnce;
      expect(consoleErrorSpy).to.have.been.calledWithExactly(error);
      done();
    });
  });

  it('should print what is send through the stream when it is a PageableStream', done => {
    // Given
    const chunk1 = [{ prop: 'value1' }];
    const chunk2 = [{ prop: 'value2' }];
    const prettyString = '- prop: value';
    const stream = new PageableStream();
    const promise = Promise.resolve(stream);
    prettyjson.render = sinon.stub().returns(prettyString);

    // When / Then
    prettyRenderer(promise).then(() => {
      stream.write(chunk1);
      stream.write(chunk2);
      stream.lastPage();
      expect(prettyjson.render).to.have.been.called.twice;
      expect(consoleLogSpy).to.have.been.called.twice;
      expect(consoleLogSpy).to.have.always.been.calledWithExactly(prettyString);
      done();
    }).catch(err => {
      done(err);
    });
  });

});
