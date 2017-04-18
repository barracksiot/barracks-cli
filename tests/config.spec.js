const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('config', () => {

  describe('#barracks.baseUrl', () => {

    let baseUrlEnvValue;

    beforeEach(() => {
      baseUrlEnvValue = process.env.BARRACKS_BASE_URL;
    });

    afterEach(() => {
      process.env.BARRACKS_BASE_URL = baseUrlEnvValue;
    });

    it('should be set as value of BARRACKS_BASE_URL when env variable is set', () => {
      // Given
      const url = 'https://not.barracks.io';
      process.env.BARRACKS_BASE_URL = url;
      // When
      const config = proxyquire('../src/config', {}).barracks;
      // Then
      expect(config).to.have.property('baseUrl').and.to.be.equals(url);
    });
    
    it('should be set as default value when BARRACKS_BASE_URL env variable is not set', () => {
      // Given
      delete process.env.BARRACKS_BASE_URL;
      // When
      const config = proxyquire('../src/config', {}).barracks;
      // Then
      expect(config).to.have.property('baseUrl').and.to.be.equals('https://app.barracks.io');
    });
  });

  describe('#debug', () => {

    let debugValue;

    beforeEach(() => {
      debugValue = process.env.DEBUG;
    });

    afterEach(() => {
      process.env.DEBUG = debugValue;
    });

    it('should be true when DEBUG env variable is set to other than 0', () => {
      // Given
      process.env.DEBUG = 1;
      // When
      const debug = proxyquire('../src/config', {}).debug;
      // Then
      expect(debug).to.be.equals(true);
    });

    it('should be false when DEBUG env variable is set to 0', () => {
      // Given
      process.env.DEBUG = 0;
      // When
      const debug = proxyquire('../src/config', {}).debug;
      // Then
      expect(debug).to.be.equals(false);
    });

    it('should be false when DEBUG env variable is not set', () => {
      // Given
      delete process.env.DEBUG;
      // When
      const debug = proxyquire('../src/config', {}).debug;
      // Then
      expect(debug).to.be.equals(false);
    });
  });

  describe('#experimental', () => {

    let experimentalValue;

    beforeEach(() => {
      experimentalValue = process.env.BARRACKS_ENABLE_EXPERIMENTAL;
    });

    afterEach(() => {
      process.env.BARRACKS_ENABLE_EXPERIMENTAL = experimentalValue;
    });

    it('should be true when BARRACKS_ENABLE_EXPERIMENTAL env variable is set to other than 0', () => {
      // Given
      process.env.BARRACKS_ENABLE_EXPERIMENTAL = 1;
      // When
      const experimental = proxyquire('../src/config', {}).experimental;
      // Then
      expect(experimental).to.be.equals(true);
    });

    it('should be false when BARRACKS_ENABLE_EXPERIMENTAL env variable is set to 0', () => {
      // Given
      process.env.BARRACKS_ENABLE_EXPERIMENTAL = 0;
      // When
      const experimental = proxyquire('../src/config', {}).experimental;
      // Then
      expect(experimental).to.be.equals(false);
    });

    it('should be false when BARRACKS_ENABLE_EXPERIMENTAL env variable is not set', () => {
      // Given
      delete process.env.BARRACKS_ENABLE_EXPERIMENTAL;
      // When
      const experimental = proxyquire('../src/config', {}).experimental;
      // Then
      expect(experimental).to.be.equals(false);
    });
  });

  describe('#v2Enabled', () => {

    let v2EnabledValue;

    beforeEach(() => {
      v2Enabled = process.env.BARRACKS_ENABLE_V2;
    });

    afterEach(() => {
      process.env.BARRACKS_ENABLE_V2 = v2Enabled;
    });

    it('should be true when BARRACKS_ENABLE_V2 env variable is set to other than 0', () => {
      // Given
      process.env.BARRACKS_ENABLE_V2 = 1;
      // When
      const v2Enabled = proxyquire('../src/config', {}).v2Enabled;
      // Then
      expect(v2Enabled).to.be.equals(true);
    });

    it('should be false when BARRACKS_ENABLE_V2 env variable is set to 0', () => {
      // Given
      process.env.BARRACKS_ENABLE_V2 = 0;
      // When
      const v2Enabled = proxyquire('../src/config', {}).v2Enabled;
      // Then
      expect(v2Enabled).to.be.equals(false);
    });

    it('should be false when BARRACKS_ENABLE_V2 env variable is not set', () => {
      // Given
      delete process.env.BARRACKS_ENABLE_V2;
      // When
      const v2Enabled = proxyquire('../src/config', {}).v2Enabled;
      // Then
      expect(v2Enabled).to.be.equals(false);
    });
  });
});
