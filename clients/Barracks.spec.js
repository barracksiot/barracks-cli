const PageableStream = require('../clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const Barracks = require('./Barracks');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

function buildSegment(segmentId) {
  return {
    id: segmentId,
    name: 'Plop'
  };
}

describe('Barracks', () => {

  let barracks;
  let mockedCreateReadStream = undefined;
  let mockedBasename = undefined;
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {};

  beforeEach(() => {
    barracks = new Barracks();
    barracks.client = {};
  });

  describe('#editUpdate()', () => {

    const originalUpdate = {
      name: 'test update',
      versionId: '2.3',
      uuid: '123456789',
      packageInfo: { id: '123456' }
    };

    const originalUpdateWithPackageId = {
      name: 'test update',
      versionId: '2.3',
      uuid: '123456789',
      packageId: '123456'
    };

    it('should return an error message when edit request fails', done => {
      // Given
      const changes = { uuid: originalUpdate.uuid, name: 'test update' };
      const error = { message: 'Error !' };
      barracks.getUpdate = sinon.stub().returns(Promise.resolve(originalUpdate));
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.editUpdate(token, changes).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.getUpdate).to.have.been.calledOnce;
        expect(barracks.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('editUpdate', {
          headers: { 'x-auth-token': token },
          body: Object.assign({}, originalUpdateWithPackageId, changes),
          pathVariables: { uuid: originalUpdateWithPackageId.uuid }
        });
        done();
      });
    });

    it('should return an error message when the update does not exist', done => {
      // Given
      const changes = { uuid: originalUpdate.uuid, name: 'test update' };
      const error = { message: 'Error !' };
      const excpectedResult = Object.assign({}, originalUpdateWithPackageId, changes);
      barracks.getUpdate = sinon.stub().returns(Promise.reject(error));
      barracks.client.sendEndpointRequest = sinon.spy();

      // When / Then
      barracks.editUpdate(token, changes).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(barracks.getUpdate).to.have.been.calledOnce;
          expect(barracks.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
          expect(barracks.client.sendEndpointRequest).to.not.have.been.called;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should return the edited update', done => {
      // Given
      const changes = { uuid: originalUpdate.uuid, name: 'test update' };
      const response = { body: originalUpdate };
      barracks.getUpdate = sinon.stub().returns(Promise.resolve(originalUpdate));
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));
      const excpectedResult = Object.assign({}, originalUpdateWithPackageId, changes);

      // When / Then
      barracks.editUpdate(token, changes).then(result => {
        expect(barracks.getUpdate).to.have.been.calledOnce;
        expect(barracks.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('editUpdate', {
          headers: { 'x-auth-token': token },
          body: excpectedResult,
          pathVariables: { uuid: originalUpdateWithPackageId.uuid }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
    
  });

  describe('#editSegment()', () => {

    const originalSegment = {
      id: '12345678',
      name: 'test segment',
      query: { eq: { unitId: '123456' } }
    };

    it('should return an error message when edit request fails', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'New name' };
      const error = { message: 'Error !' };
      barracks.getSegment = sinon.stub().returns(Promise.resolve(originalSegment));
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.editSegment(token, changes).then(result => {
        done('should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(barracks.getSegment).to.have.been.calledOnce;
          expect(barracks.getSegment).to.have.been.calledWithExactly(token, changes.id);
          expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
          expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('editSegment', {
            headers: { 'x-auth-token': token },
            body: Object.assign({}, originalSegment, changes),
            pathVariables: { id: originalSegment.id }
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should return an error message when the segment does not exist', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'test segment' };
      const error = { message: 'Error !' };
      const excpectedResult = Object.assign({}, originalSegment, changes);
      barracks.getSegment = sinon.stub().returns(Promise.reject(error));
      barracks.client.sendEndpointRequest = sinon.spy();

      // When / Then
      barracks.editSegment(token, changes).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(barracks.getSegment).to.have.been.calledOnce;
          expect(barracks.getSegment).to.have.been.calledWithExactly(token, changes.id);
          expect(barracks.client.sendEndpointRequest).to.not.have.been.called;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should return the edited segment', done => {
      // Given
      const changes = { id: originalSegment.id, name: 'NaaaAAmE' };
      const expectedResult = Object.assign({}, originalSegment, changes);
      const response = { body: expectedResult };
      barracks.getSegment = sinon.stub().returns(Promise.resolve(originalSegment));
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.editSegment(token, changes).then(result => {
        expect(result).to.be.equal(expectedResult);
        expect(barracks.getSegment).to.have.been.calledOnce;
        expect(barracks.getSegment).to.have.been.calledWithExactly(token, changes.id);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('editSegment', {
          headers: { 'x-auth-token': token },
          body: expectedResult,
          pathVariables: { id: originalSegment.id }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
    
  });

  describe('#authenticate()', () => {

    it('should return an error message when authentication fails', done => {
      // Given
      const username = 'user';
      const password = 'password';
      const error = { message: 'Login failed' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.authenticate(username, password).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('login', {
          body: { username, password }
        });
        done();
      });
    });

    it('should return a token when authentication succeed', done => {
      // Given
      const username = 'user';
      const password = 'password';
      const response = { headers: { 'x-auth-token': token } };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.authenticate(username, password).then(result => {
        expect(result).to.be.equals(token);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('login', {
          body: { username, password }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getAccount()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getAccount(token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('me', {
          headers: { 'x-auth-token': token }
        });
        done();
      });
    });

    it('should return a token when authentication succeed', done => {
      // Given
      const account = { apiKey: 'qwertyuiop', username: 'coucou' };
      const response = { body: account };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getAccount(token).then(result => {
        expect(result).to.be.equals(account);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('me', {
          headers: { 'x-auth-token': token }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getSegment()', () => {

    const existingSegment = {
      id: '123456789',
      name: 'Plop',
      query: {}
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getSegment(token, existingSegment.id).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegment', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            id: existingSegment.id
          }
        });
        done();
      });
    });

    it('should return a segment when request succeed', done => {
      // Given
      const response = { body: existingSegment };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegment(token, existingSegment.id).then(result => {
        expect(result).to.be.equals(existingSegment);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegment', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            id: existingSegment.id
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
    
  });

  describe('#getUpdate()', () => {

    const existingUpdate = {
      uuid: '123456789',
      name: 'Plop',
      versionId: 'Cool'
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getUpdate(token, existingUpdate.uuid).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            uuid: existingUpdate.uuid
          }
        });
        done();
      });
    });

    it('should return an update when request succeed', done => {
      // Given
      const response = { body: existingUpdate };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getUpdate(token, existingUpdate.uuid).then(result => {
        expect(result).to.be.equals(existingUpdate);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            uuid: existingUpdate.uuid
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
    
  });

  describe('#getUpdates()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const options = { headers: {
        'x-auth-token': token
      }}
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getUpdates(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getUpdates',
          options,
          'detailedUpdates'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getUpdatesySegmentId()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const segmentId = 'mySegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      };
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getUpdatesBySegmentId(token, segmentId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'updatesBySegmentId',
          options,
          'detailedUpdates'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#publishUpdate()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const updateId = 'poiuytrewq';
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.publishUpdate(token, updateId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('publishUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: { uuid: updateId }
        });
        done();
      });
    });

    it('should return update info when publication succeed', done => {
      // Given
      const updateId = 'poiuytrewq';
      const update = { uuid: updateId, status: 'published' };
      const response = { body: update };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.publishUpdate(token, updateId).then(result => {
        expect(result).to.be.equals(update);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('publishUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: { uuid: updateId }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#archiveUpdate()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const updateId = 'poiuytrewq';
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.archiveUpdate(token, updateId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('archiveUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: { uuid: updateId }
        });
        done();
      });
    });

    it('should return update info when archivage succeed', done => {
      // Given
      const updateId = 'poiuytrewq';
      const update = { uuid: updateId, status: 'archived' };
      const response = { body: update };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.archiveUpdate(token, updateId).then(result => {
        expect(result).to.be.equals(update);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('archiveUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: { uuid: updateId }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#scheduleUpdate()', () => {

    it('should return update info when schedule succeed', done => {
      // Given
      const uuid = 'poiuytrewq';
      const date = new Date();
      const update = { uuid: uuid, status: 'scheduled' };
      const response = { body: update };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.scheduleUpdate(token, uuid, date).then(result => {
        expect(result).to.be.equals(update);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('scheduleUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            uuid,
            time: date.toISOString() 
          }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error when schedule failed', done => {
      // Given
      const uuid = 'poiuytrewq';
      const date = new Date();
      const error = 'Error!';
      const response = { message: error };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(response));

      // When / Then
      barracks.scheduleUpdate(token, uuid, date).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('scheduleUpdate', {
          headers: { 'x-auth-token': token },
          pathVariables: {
            uuid,
            time: date.toISOString() 
          }
        });
        done();
      });
    });
  });

  describe('#createPackage()', () => {

    beforeEach(() => {
      const ProxifiedBarracks = proxyquire('./Barracks', {
        fs: { createReadStream: file => { return mockedCreateReadStream(file) } },
        path: { basename: file => { return mockedBasename(file) } }
      });

      barracks = new ProxifiedBarracks();
    });

    it('should return the package created', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      const response = { body: 'coucou' }
      const fileReadStream = 'fileReadStream';
      const file = 'file';
      const versionId = 'version';
      const package = { versionId, file };

      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));
      mockedCreateReadStream = sinon.stub().returns(fileReadStream);
      mockedBasename = sinon.stub().returns(file);

      // When / Then
      barracks.createPackage(token, package).then(result => {
        expect(result).to.be.equals(response.body);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createPackage',
          {
            headers: { 'x-auth-token': token },
            formData: {
              versionId: versionId,
              file: {
                value: fileReadStream,
                options: { filename: file }
              }
            }
          }
        );
        expect(mockedCreateReadStream).to.have.been.calledOnce;
        expect(mockedCreateReadStream).to.have.been.calledWithExactly(file);
        expect(mockedBasename).to.have.been.calledOnce;
        expect(mockedBasename).to.have.been.calledWithExactly(file);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error if request fails', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      const response = { message: 'error' }
      const fileReadStream = 'fileReadStream';
      const file = 'file';
      const versionId = 'version';
      const package = { versionId, file };

      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(response));
      mockedCreateReadStream = sinon.stub().returns(fileReadStream);
      mockedBasename = sinon.stub().returns(file);

      // When / Then
      barracks.createPackage(token, package).then(result => {
        done('shoud have failed');
      }).catch(err => {
        expect(err).to.be.equals(response.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly(
          'createPackage',
          {
            headers: { 'x-auth-token': token },
            formData: {
              versionId: versionId,
              file: {
                value: fileReadStream,
                options: { filename: file }
              }
            }
          }
        );
        expect(mockedCreateReadStream).to.have.been.calledOnce;
        expect(mockedCreateReadStream).to.have.been.calledWithExactly(file);
        expect(mockedBasename).to.have.been.calledOnce;
        expect(mockedBasename).to.have.been.calledWithExactly(file);
        done();
      });
    });
  });

  describe('#getSegmentByName()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const segmentName = 'segment prod';
      const error = 'Error !';
      barracks.getSegments = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(barracks.getSegments).to.have.been.calledOnce;
        expect(barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return an error if segment does not exists', done => {
      // Given
      const segmentName = 'segment prod';
      const response = {
        active: [
          { id: 'zxcvbnm', name: 'segment' },
          { id: 'zxcvbnm', name: 'other segment' }
        ],
        other: { id: 'other', name: 'Other' }
      };
      barracks.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('No matching active segment.');
        expect(barracks.getSegments).to.have.been.calledOnce;
        expect(barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return specified active segment info when request succeed', done => {
      // Given
      const segmentName = 'segment prod';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = { active: [ segment, { id: 'zxcvbnm', name: 'other segment' } ], other: { id: 'other', name: 'Other' } };
      barracks.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        expect(result).to.be.equals(segment);
        expect(barracks.getSegments).to.have.been.calledOnce;
        expect(barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return other segment when name is other when request succeed', done => {
      // Given
      const segmentName = 'Other';
      const segment = { id: 'other', name: segmentName };
      const response = { active: [ { id: 'zxcvbnm', name: 'other segment' } ], other: segment };
      barracks.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        expect(result).to.be.equals(segment);
        expect(barracks.getSegments).to.have.been.calledOnce;
        expect(barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should not return specified segment when inactive', done => {
      // Given
      const segmentName = 'segment prod';
      const segment = { id: 'lkjhgfdsa', name: segmentName };
      const response = { inactive: [ segment, { id: 'zxcvbnm', name: 'other segment' } ], active: [] };
      barracks.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(barracks.getSegments).to.have.been.calledOnce;
        expect(barracks.getSegments).to.have.been.calledWithExactly(token);
        done();
      });
    });

  });

  describe('#getSegments()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getSegments(token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      });
    });

    it('should return segment list when request succeed', done => {
      // Given
      const segment1 = { id: 'lkjhgfdsa', name: 'prod' };
      const segment2 = { id: 'qwertyuio', name: 'alpha' };
      const segment3 = { id: 'vyugyu', name: 'plop' };
      const activeSegments = [ segment1, segment2 ];
      const inactiveSegments = [ segment3 ];
      const body = { active: activeSegments, inactive: inactiveSegments };
      const response = { body };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegments(token).then(result => {
        expect(result).to.be.equals(body);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#createUpdate()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const update = { name: 'test update', versionId: '2.3' };
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.createUpdate(token, update).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createUpdate', {
          headers: { 'x-auth-token': token },
          body: update
        });
        done();
      });
    });

    it('should return the update created', done => {
      // Given
      const update = { name: 'test update', versionId: '2.3' };
      const updateFull = { name: 'test update', versionId: '2.3', uuid: '1234567890poiuytrew' };
      const response = { body: updateFull };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.createUpdate(token, update).then(result => {
        expect(result).to.be.equals(updateFull);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createUpdate', {
          headers: { 'x-auth-token': token },
          body: update
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

  });

  describe('#createSegment()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const segment = { name: 'Segment', query: { eq: { unitId: 'value' } } };
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.createSegment(token, segment).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createSegment', {
          headers: { 'x-auth-token': token },
          body: segment
        });
        done();
      });
    });

    it('should return the created segment', done => {
      // Given
      const segment = { name: 'Segment', query: { eq: { unitId: 'value' } } };
      const savedSegment = Object.assign({}, segment, { userId: '123456789' });
      const response = { body: savedSegment };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.createSegment(token, segment).then(result => {
        expect(result).to.be.equals(savedSegment);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createSegment', {
          headers: { 'x-auth-token': token },
          body: segment
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

  });

  describe('#createFilter()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const error = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.createFilter(token, filter).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createFilter', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      });
    });

    it('should return the created filter', done => {
      // Given
      const filter = { name: 'Filter', query: { eq: { unitId: 'value' } } };
      const savedFilter = Object.assign({}, filter, { userId: '123456789' });
      const response = { body: savedFilter };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.createFilter(token, filter).then(result => {
        expect(result).to.be.equals(savedFilter);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('createFilter', {
          headers: { 'x-auth-token': token },
          body: filter
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getFilterByName()', () => {

    const filterName = 'myCoolFilter';
    const filter = { name: filterName, query: { eq: { unitId: 'plop' } } };

    it('should return an error message when request fails', done => {
      // Given
      const error = 'Error !';
      barracks.getFilters = sinon.stub().returns(Promise.reject(error));

      // When / Then
      barracks.getFilterByName(token, filterName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(barracks.getFilters).to.have.been.calledOnce;
        expect(barracks.getFilters).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return an error if filter does not exists', done => {
      // Given
      const response = [
        { name: 'sdfghjkl', query: { eq: { unitId: 'plop' } } },
        { name: 'zxcvbnm', query: { ne: { unitId: 'replop' } } }
      ];
      barracks.getFilters = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getFilterByName(token, filterName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals('No filter with name ' + filterName + ' found.');
        expect(barracks.getFilters).to.have.been.calledOnce;
        expect(barracks.getFilters).to.have.been.calledWithExactly(token);
        done();
      });
    });

    it('should return specified filter when request succeed', done => {
      // Given
      const response = [
        { name: 'sdfghjkl', query: { eq: { unitId: 'plop' } } },
        { name: 'zxcvbnm', query: { ne: { unitId: 'replop' } } },
        filter
      ];
      barracks.getFilters = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getFilterByName(token, filterName).then(result => {
        expect(result).to.be.equals(filter);
        expect(barracks.getFilters).to.have.been.calledOnce;
        expect(barracks.getFilters).to.have.been.calledWithExactly(token);
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getFilters()', () => {

    it('should forward to the client with correct headers', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token },
      }
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getFilters(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getFilters',
          options,
          'filters'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getSegmentDevices()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const segmentId = 'aSegment';
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { segmentId }
      }
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getSegmentDevices(token, segmentId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getSegmentDevices',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDevices()', () => {

    it('should return a stream object and deleguate to the client when no query given', done => {
      // Given
      const options = {
        headers: { 'x-auth-token': token }
      };
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getDevices(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevices',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return a stream object and deleguate to the client when query given', done => {
      // Given
      const query = { eq: { unitId: 'plop' } };
      const options = {
        headers: { 'x-auth-token': token },
        pathVariables: { query: encodeURI(JSON.stringify(query)) }
      };
      barracks.client.retrieveAllPages = sinon.spy();

      // When / Then
      barracks.getDevices(token, query).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrieveAllPages).to.have.been.calledOnce;
        expect(barracks.client.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDevicesWithQuery',
          options,
          'devices'
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getDeviceEvents()', () => {

    it('should return a stream object and deleguate to the client', done => {
      // Given
      const unitId = 'myUnit';
      const options = { 
        headers: { 'x-auth-token': token },
        pathVariables: { unitId }
      };
      barracks.client.retrievePagesUntilCondition = sinon.spy();

      // When / Then
      barracks.getDeviceEvents(token, unitId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(barracks.client.retrievePagesUntilCondition).to.have.been.calledOnce;
        expect(barracks.client.retrievePagesUntilCondition).to.have.been.calledWithExactly(
          new PageableStream(),
          'getDeviceEvents',
          options,
          'deviceEvents',
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#getSegments()', () => {

    it('should return the user segments', done => {
      // Given
      const segments = {
        active: [buildSegment(1), buildSegment(2)],
        inactive: [buildSegment(3), buildSegment(4)]
      };
      const response = { body: segments };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegments(token).then(result => {
        expect(result).to.be.equals(segments);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return an error when the request failed', done => {
      // Given
      const errorMessage = "Error";
      const errorResponse = { message: errorMessage };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(errorResponse));

      // When / Then
      barracks.getSegments(token).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorMessage);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('getSegments', {
          headers: { 'x-auth-token': token }
        });
        done();
      });
    });

  });

  describe('#setActiveSegments()', () => {

    const segmentIds = [ '12345', '67890' ];

    it('should return an error message when request fails', done => {
      // Given
      const errorResponse = { message: 'Error !' };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.reject(errorResponse));

      // When / Then
      barracks.setActiveSegments(token, segmentIds).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(errorResponse.message);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('setActiveSegments', {
          headers: { 'x-auth-token': token },
          body: segmentIds
        });
        done();
      });
    });

    it('should return segment ids when request is successful', done => {
      // Given
      const response = { body: segmentIds };
      barracks.client.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.setActiveSegments(token, segmentIds).then(result => {
        expect(result).to.be.equals(segmentIds);
        expect(barracks.client.sendEndpointRequest).to.have.been.calledOnce;
        expect(barracks.client.sendEndpointRequest).to.have.been.calledWithExactly('setActiveSegments', {
          headers: { 'x-auth-token': token },
          body: segmentIds
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#checkUpdate()', () => {

    it('should reject an error if client fail', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      });
    });

    it('should return a message if no update available', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(undefined));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals('No update available');
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call client with empty customClientData when device with no customClientData given', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call client with customClientData when device with customClientData given', done => {
      // Given
      const baseUrl = 'base/url';
      const apiKey = 'myApiKey';
      const unitId = 'unitId';
      const versionId = 'version1';
      const customClientData = { data1: 'value', data2: 4 };
      const response = { versionId: 'version2', packageId: 'id' };
      const device = { unitId, versionId, customClientData };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(response));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdate(apiKey, device).then(result => {
        expect(result).to.be.equals(response);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          customClientData
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#checkUpdateAndDownload()', () => {

    const baseUrl = 'base/url';
    const apiKey = 'myApiKey';
    const unitId = 'unitId';
    const versionId = 'version1';
    const filePath = 'path/to/update';

    it('should reject an error if client fail', done => {
      // Given
      const error = 'blah error';
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.reject(error));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      });
    });

    it('should return a message if no update available', done => {
      // Given
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(undefined));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        expect(result).to.be.equals('No update available');
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should call download if an update is available', done => {
      // Given
      const device = { unitId, versionId };
      const constructorSpy = sinon.spy();
      const file = 'testFile';
      const downloadSpy = sinon.stub().returns(Promise.resolve(file));
      const update = { download: downloadSpy };
      const checkUpdateSpy = sinon.stub().returns(Promise.resolve(update));
      const ProxifiedBarracks = proxyquire('./Barracks', {
        'barracks-sdk': function Constructor (options) {
          constructorSpy(options);
          this.checkUpdate = checkUpdateSpy;
        }
      });

      barracks = new ProxifiedBarracks();
      barracks.options = { baseUrl };
      
      // When / Then
      barracks.checkUpdateAndDownload(apiKey, device, filePath).then(result => {
        expect(result).to.be.equals(file);
        expect(constructorSpy).to.have.been.calledOnce;
        expect(constructorSpy).to.have.been.calledWithExactly({
          baseURL: baseUrl,
          apiKey,
          unitId,
          downloadFilePath: filePath
        });
        expect(checkUpdateSpy).to.have.been.calledOnce;
        expect(checkUpdateSpy).to.have.been.calledWithExactly(
          versionId,
          undefined
        );
        expect(downloadSpy).to.have.been.calledOnce;
        expect(downloadSpy).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
