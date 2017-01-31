const chai = require('chai');
const PageableStream = require('../clients/PageableStream');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require("chai-as-promised");
const prettyRenderer = require('./prettyRenderer');
const prettyjson = require('prettyjson');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('prettyRenderer', () => {

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalPrettyRender = prettyjson.render;

  beforeEach(() => {
    console.log = sinon.spy();
    console.error = sinon.spy();
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
      expect(console.log).to.have.been.calledOnce;
      expect(console.log).to.have.been.calledWithExactly(prettyString);
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
      expect(prettyjson.render).to.have.not.been.called;
      expect(console.error).to.have.been.calledOnce;
      expect(console.error).to.have.been.calledWithExactly(error);
      done();
    }).catch(err => {
      done(err);
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
      expect(console.log).to.have.been.called.twice;
      expect(console.log).to.have.always.been.calledWithExactly(prettyString);
      done();
    }).catch(err => {
      done(err);
    });
  });

});
