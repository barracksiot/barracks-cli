const validatorPath = '../../src/utils/Validator';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const Validator = require(validatorPath);
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Validator', () => {

  describe('#isJsonObject()', () => {
  
    it('should return true when given string in JSON', () => {
      // Given
      const value = JSON.stringify({ test: 'plop' });
      // When
      const result = Validator.isJsonObject(value);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when given string is not JSON', () => {
      // Given
      const value = 'not a json string }';
      // When
      const result = Validator.isJsonObject(value);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#isJsonArray()', () => {
  
    it('should return true when given string is JSON Array', () => {
      // Given
      const value = JSON.stringify(['plop']);
      // When
      const result = Validator.isJsonArray(value);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when given string is not a JSON', () => {
      // Given
      const value = 'not a json string }';
      // When
      const result = Validator.isJsonArray(value);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when given string is a JSON but not an array', () => {
      // Given
      const value = '{}';
      // When
      const result = Validator.isJsonArray(value);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#fileExists()', () => {

    let proxyAccessSync;

    const F_OK = 'OKAYY';
    const ProxyValidator = proxyquire(validatorPath, {
      'fs': {
        accessSync: (path, option) => {
          proxyAccessSync(path, option);
        },
        F_OK
      }
    });
  
    it('should return true when given string is path to existing file', () => {
      // Given
      const filePath = 'path/to/file/that/exists.txt';
      const spyAccessSync = sinon.spy();
      proxyAccessSync = (path, option) => {
        spyAccessSync(path, option);
        return 'file';
      };

      // When
      const result = ProxyValidator.fileExists(filePath);

      // Then
      expect(result).to.be.true;
      expect(spyAccessSync).to.have.been.calledOnce;
      expect(spyAccessSync).to.have.been.calledWithExactly(filePath, F_OK);
    });

    it('should return false when given string is path to a file that do not exists', () => {
      // Given
      const filePath = 'path/to/file/that/do/not/exists.txt';
      const spyAccessSync = sinon.spy();
      proxyAccessSync = (path, option) => {
        spyAccessSync(path, option);
        throw 'That file does not exists !';
      };

      // When
      const result = ProxyValidator.fileExists(filePath);
      
      // Then
      expect(result).to.be.false;
      expect(spyAccessSync).to.have.been.calledOnce;
      expect(spyAccessSync).to.have.been.calledWithExactly(filePath, F_OK);
    });
  });
});