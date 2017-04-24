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

describe('FileReader', () => {

  const file = 'path/to/file.json';
  let FileReader;

  describe('#getObjectFromString()', () => {

    let mockIsJsonObject;
    let spyIsJsonObject;

    beforeEach( () => {
      FileReader = proxyquire('../../src/utils/FileReader', {
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
      FileReader.getObjectFromString(data).then(result => {
        expect(result).to.be.deep.equals(object);
        expect(spyIsJsonObject).to.have.been.calledOnce;
        expect(spyIsJsonObject).to.have.been.calledWithExactly(data);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject error when given file is not a JSON file', done => {
      // Given
      const data = 'notaJsonKey": "aJsonValue"}';

      mockIsJsonObject = (data) => {
        spyIsJsonObject(data);
        return false;
      };

      // When / Then
      FileReader.getObjectFromString(data).then(result => {
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
      FileReader = proxyquire('../../src/utils/FileReader', {
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
      FileReader.readObjectFromFile(file).then(result => {
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

      FileReader.getObjectFromString = sinon.stub().returns(Promise.reject(error));

      // When / Then
      FileReader.readObjectFromFile(file).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(spyReadObjectFromFile).to.have.been.calledOnce;
        expect(spyReadObjectFromFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(FileReader.getObjectFromString).to.have.been.calledOnce;
        expect(FileReader.getObjectFromString).to.have.been.calledWithExactly(data);
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

      FileReader.getObjectFromString = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      FileReader.readObjectFromFile(file).then(result => {
        expect(result).to.be.equals(response);
        expect(spyReadObjectFromFile).to.have.been.calledOnce;
        expect(spyReadObjectFromFile).to.have.been.calledWithExactly(file, sinon.match.func);
        expect(FileReader.getObjectFromString).to.have.been.calledOnce;
        expect(FileReader.getObjectFromString).to.have.been.calledWithExactly(data);
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
      FileReader = proxyquire('../../src/utils/FileReader', {
        'in-stream': mockStream
      });
      spyOnData = sinon.spy();
      spyOnClose = sinon.spy();
      spyOnError = sinon.spy();
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
    });

    it ('should reject error when input stream returns error', done => {
      // Given
      const error = 'This is an error';

      setTimeout(() => {
        mockStream.emit('data', "dataaaaaaaaaaaaaaaaAAAAAAAAAAA");
        mockStream.emit('error', error);
      }, 50);

      // When / Then
      console.log('1');
      console.log(mockStream);
      FileReader.readObjectFromStdin().then(result => {
        done('Should have failed');
      }).catch(err => {
      /*  expect(err).to.be.equals(error);
        expect(spyOnError).to.have.been.calledOnce;
        expect(spyOnError).to.have.been.calledWithExactly(error);*/
        done();
      });
    });

    it ('should reject error when stream content is not valid', done => {
      // Given
      const data = '{ "aJsonKey": "aJsonValue", "anotherKey": "anotherValue" }';
      const error = 'My terrible error';

      setTimeout(() => {
        mockStream.emit('data', data);
        mockStream.emit('close');
      }, 50);

      FileReader.getObjectFromString = sinon.stub().returns(Promise.reject(error));

      // When / Then
      FileReader.readObjectFromStdin().then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(FileReader.getObjectFromString).to.have.been.calledOnce;
        expect(FileReader.getObjectFromString).to.have.been.calledWithExactly(data);
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

      FileReader.getObjectFromString = sinon.stub().returns(Promise.resolve(object));

      // When / Then
      FileReader.readObjectFromStdin().then(result => {
        expect(result).to.be.equals(object);
        expect(FileReader.getObjectFromString).to.have.been.calledOnce;
        expect(FileReader.getObjectFromString).to.have.been.calledWithExactly(data);
        done();
      }).catch(err => {
        done('Should have succeeded');
      });
    });
  });

  describe('#getObject()', () => {

    beforeEach( () => {
      FileReader = require('../../src/utils/FileReader');
    });

    it ('should forward to readObjectFromFile when file is given', () => {
      // Given
      const program = { file } ;
      const object = { 'key' : 'value' };

      FileReader.readObjectFromFile = sinon.stub().returns(object);

      // When
      const result = FileReader.getObject(program);

      // Then
      expect(result).to.be.equals(object);
      expect(FileReader.readObjectFromFile).to.have.been.calledOnce;
      expect(FileReader.readObjectFromFile).to.have.been.calledWithExactly(program.file);
    });

    it ('should forward to readObjectFromStdin when no file is given', () => {
      // Given
      const program =  {} ;
      const object = { 'key' : 'value' };

      FileReader.readObjectFromStdin = sinon.stub().returns(object);

      // When
      const result = FileReader.getObject(program);

      // Then
      expect(result).to.be.equals(object);
      expect(FileReader.readObjectFromStdin).to.have.been.calledOnce;
      expect(FileReader.readObjectFromStdin).to.have.been.calledWithExactly();
    });
  });
});