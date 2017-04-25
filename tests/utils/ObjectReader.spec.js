const validatorPath = '../../src/utils/Validator';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const Validator = require(validatorPath);
const proxyquire = require('proxyquire').noCallThru();
const Stream = require('stream');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('ObjectReader', () => {

  const file = 'path/to/file.json';
  let ObjectReader;

  describe('#getObjectFromString()', () => {

    let mockIsJsonObject;
    let spyIsJsonObject;

    beforeEach( () => {
      ObjectReader = proxyquire('../../src/utils/ObjectReader', {
        './Validator': {
          isJsonObject: (str) => {
            return mockIsJsonObject(str);
          }
        }
      });
      spyIsJsonObject = sinon.spy();
    });

    it('should return object when given string is a valid JSON', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const object = { 'aJsonKey': 'aJsonValue', 'anotherKey': 'anotherValue' };

      mockIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return true;
      };

      // When / Then
      ObjectReader.getObjectFromString(data).then(result => {
        expect(result).to.be.deep.equals(object);
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject error when given string is not a valid JSON', done => {
      // Given
      const data = 'notaJsonKey": "aJsonValue"}';

      mockIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return false;
      };

      // When / Then
      ObjectReader.getObjectFromString(data).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('Object must be described by a valid JSON');
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      })
    })
  });

  describe('#readObjectFromFile()', () => {

    let mockReadObjectFromFile;
    let spyReadObjectFromFile;

    beforeEach( () => {
      ObjectReader = proxyquire('../../src/utils/ObjectReader', {
        'fs': {
          readFile: (file, callback) => {
            return mockReadObjectFromFile(file, callback);
          }
        }
      });
      spyReadObjectFromFile = sinon.spy();
    });

    it('should reject error when when readFile returns error', done => {
      // Given
      const error = 'a terrible error';

      mockReadObjectFromFile = (file, callback) => {
        spyReadObjectFromFile(file, callback);
        callback(error);
      };

      // When / Then
      ObjectReader.readObjectFromFile(file).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(spyReadObjectFromFile).to.have.been.calledOnce;
        expect(spyReadObjectFromFile).to.have.been.calledWithExactly(file, sinon.match.func);
        done();
      });
    });

    it ('should reject an error when getObjectFromString rejects error', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const error = 'Error';

      mockReadObjectFromFile = (file, callback) => {
        spyReadObjectFromFile(file, callback);
        callback(undefined, data);
      };

      ObjectReader.getObjectFromString = sinon.stub().returns(Promise.reject(error));

      // When / Then
      ObjectReader.readObjectFromFile(file).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(spyReadObjectFromFile).to.have.been.calledOnce;
        expect(spyReadObjectFromFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(ObjectReader.getObjectFromString).to.have.been.calledOnce;
        expect(ObjectReader.getObjectFromString).to.have.been.calledWithExactly(data);
        done();
      });
    });

    it ('should resolve object when everything is fine', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const response = { 'aJsonKey': 'aJsonValue', 'anotherKey': 'anotherValue' };

      mockReadObjectFromFile = (file, callback) => {
        spyReadObjectFromFile(file, callback);
        callback(undefined, data);
      };

      ObjectReader.getObjectFromString = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      ObjectReader.readObjectFromFile(file).then(result => {
        expect(result).to.be.equals(response);
        expect(spyReadObjectFromFile).to.have.been.calledOnce;
        expect(spyReadObjectFromFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(ObjectReader.getObjectFromString).to.have.been.calledOnce;
        expect(ObjectReader.getObjectFromString).to.have.been.calledWithExactly(data);
        done();
      }).catch(err => {
        done('Should have succeeded');
      });
    });
  });

  describe('#readObjectFromStdin', () => {
    let spyOnData;
    let spyOnClose;
    let spyOnError;
    let mockStream = new Stream();

    beforeEach( () => {
      mockStream = new Stream();
      mockStream.on('data', data => {
        spyOnData(data);
      });
      mockStream.on('close', () => {
        spyOnClose();
      });
      mockStream.on('error', error => {
        spyOnError(error);
      });

      ObjectReader = proxyquire('../../src/utils/ObjectReader', {
        'in-stream': mockStream
      });
    });

    it ('should reject error when input stream returns error', done => {
      // Given
      const error = 'This is an error';
      spyOnError = sinon.spy();
      setTimeout(() => {
        mockStream.emit('error', error);
      }, 50);

      // When / Then
      ObjectReader.readObjectFromStdin().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(spyOnError).to.have.been.calledOnce;
        expect(spyOnError).to.have.been.calledWithExactly(error);
        done();
      });
    });

    it ('should reject error when stream content is not valid', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const error = 'My terrible error';
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      spyOnError = sinon.spy();
      setTimeout(() => {
        mockStream.emit('data', data);
        mockStream.emit('close');
      }, 50);

      ObjectReader.getObjectFromString = sinon.stub().returns(Promise.reject(error));

      // When / Then
      ObjectReader.readObjectFromStdin().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(ObjectReader.getObjectFromString).to.have.been.calledOnce;
        expect(ObjectReader.getObjectFromString).to.have.been.calledWithExactly(data);
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        done();
      });
    });

    it ('should resolve object when stream content is valid', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const object = { 'aJsonKey': 'aJsonValue', 'anotherKey': 'anotherValue' };
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();

      setTimeout(() => {
        mockStream.emit('data', data);
        mockStream.emit('close');
      }, 50);

      ObjectReader.getObjectFromString = sinon.stub().returns(Promise.resolve(object));

      // When / Then
      ObjectReader.readObjectFromStdin().then(result => {
        expect(result).to.be.equals(object);
        expect(ObjectReader.getObjectFromString).to.have.been.calledOnce;
        expect(ObjectReader.getObjectFromString).to.have.been.calledWithExactly(data);
        expect(spyOnData).to.have.been.calledOnce;
        expect(spyOnData).to.have.been.calledWithExactly(data);
        expect(spyOnClose).to.have.been.calledOnce;
        expect(spyOnClose).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done('Should have succeeded');
      });
    });
  });
});