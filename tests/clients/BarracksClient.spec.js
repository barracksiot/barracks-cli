const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const Barracks = require('../../src/clients/BarracksClient');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Barracks', () => {

  let barracksClient;

  beforeEach(() => {
    barracksClient = undefined;
  });

  describe('#constructor()', () => {

    it('should initialize methods from accountClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('authenticate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getAccount').and.to.be.a('function');
      expect(barracksClient).to.have.property('setGoogleAnalyticsTrackingId').and.to.be.a('function');
      expect(barracksClient).to.have.property('setGoogleClientSecret').and.to.be.a('function');
      expect(barracksClient).to.have.property('removeGoogleClientSecret').and.to.be.a('function');
    });

    it('should initialize methods from deviceClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('getDevice').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevices').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevicesFilteredByQuery').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDevicesBySegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDeviceEvents').and.to.be.a('function');
    });

    it('should initialize methods from filterClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createFilter').and.to.be.a('function');
      expect(barracksClient).to.have.property('updateFilter').and.to.be.a('function');
      expect(barracksClient).to.have.property('getFilter').and.to.be.a('function');
      expect(barracksClient).to.have.property('getFilters').and.to.be.a('function');
      expect(barracksClient).to.have.property('deleteFilter').and.to.be.a('function');
    });

    it('should initialize methods from messageClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('sendMessage').and.to.be.a('function');
      expect(barracksClient).to.have.property('sendMessageToAll').and.to.be.a('function');
    })

    it('should initialize methods from packageClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createPackage').and.to.be.a('function');
      expect(barracksClient).to.have.property('getPackage').and.to.be.a('function');
      expect(barracksClient).to.have.property('getPackages').and.to.be.a('function');
      expect(barracksClient).to.have.property('createVersion').and.to.be.a('function');
      expect(barracksClient).to.have.property('getVersion').and.to.be.a('function');
      expect(barracksClient).to.have.property('getPackageVersions').and.to.be.a('function');
      expect(barracksClient).to.have.property('publishDeploymentPlan').and.to.be.a('function');
      expect(barracksClient).to.have.property('getDeploymentPlan').and.to.be.a('function');
    });

    it('should initialize methods from segmentClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('editSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegmentByName').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegment').and.to.be.a('function');
      expect(barracksClient).to.have.property('getSegments').and.to.be.a('function');
      expect(barracksClient).to.have.property('setActiveSegments').and.to.be.a('function');
    });

    it('should initialize methods from tokenClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createToken').and.to.be.a('function');
      expect(barracksClient).to.have.property('getTokens').and.to.be.a('function');
      expect(barracksClient).to.have.property('revokeToken').and.to.be.a('function');
    });

    it('should initialize methods from updateClient when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('createUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('createUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('editUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdates').and.to.be.a('function');
      expect(barracksClient).to.have.property('getUpdatesBySegmentId').and.to.be.a('function');
      expect(barracksClient).to.have.property('publishUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('archiveUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('scheduleUpdate').and.to.be.a('function');
    });

    it('should initialize methods from sdk proxy when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('checkUpdate').and.to.be.a('function');
      expect(barracksClient).to.have.property('checkUpdateAndDownload').and.to.be.a('function');
      expect(barracksClient).to.have.property('resolveDevicePackages').and.to.be.a('function');
    });

    it('should initialize method from sdk messaging proxy when constructor called', () => {
      // When
      const barracksClient = new Barracks();

      // Then
      expect(barracksClient).to.have.property('listenMessages').and.to.be.a('function');
    });
  });
});
