const PageableStream = require('../../src/clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const UpdateClient = require('../../src/clients/UpdateClient');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UpdateClient', () => {

  let updateClient;
  const token = 'i8uhkj.token.65ryft';

  beforeEach(() => {
    updateClient = new UpdateClient();
    updateClient.httpClient = {};
    updateClient.v2Enabled = false;
  });

  describe('#createUpdate()', () => {

    it('should return an error message when request fails', done => {
      // Given
      const update = { name: 'test update', versionId: '2.3' };
      const error = { message: 'Error !' };
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateClient.createUpdate(token, update).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      updateClient.createUpdate(token, update).then(result => {
        expect(result).to.be.equals(updateFull);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('createUpdate', {
          headers: { 'x-auth-token': token },
          body: update
        });
        done();
      }).catch(err => {
        done(err);
      });
    });
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
      updateClient.getUpdate = sinon.stub().returns(Promise.resolve(originalUpdate));
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateClient.editUpdate(token, changes).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(updateClient.getUpdate).to.have.been.calledOnce;
        expect(updateClient.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('editUpdate', {
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
      updateClient.getUpdate = sinon.stub().returns(Promise.reject(error));
      updateClient.httpClient.sendEndpointRequest = sinon.spy();

      // When / Then
      updateClient.editUpdate(token, changes).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error.message);
          expect(updateClient.getUpdate).to.have.been.calledOnce;
          expect(updateClient.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
          expect(updateClient.httpClient.sendEndpointRequest).to.not.have.been.called;
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
      updateClient.getUpdate = sinon.stub().returns(Promise.resolve(originalUpdate));
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));
      const excpectedResult = Object.assign({}, originalUpdateWithPackageId, changes);

      // When / Then
      updateClient.editUpdate(token, changes).then(result => {
        expect(updateClient.getUpdate).to.have.been.calledOnce;
        expect(updateClient.getUpdate).to.have.been.calledWithExactly(token, changes.uuid);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('editUpdate', {
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

  describe('#getUpdate()', () => {

    const existingUpdate = {
      uuid: '123456789',
      name: 'Plop',
      versionId: 'Cool'
    };

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateClient.getUpdate(token, existingUpdate.uuid).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      updateClient.getUpdate(token, existingUpdate.uuid).then(result => {
        expect(result).to.be.equals(existingUpdate);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('getUpdate', {
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
      const options = {
        headers: {
          'x-auth-token': token
        }
      }
      updateClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      updateClient.getUpdates(token).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(updateClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(updateClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'getUpdates',
          options,
          'updates'
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
      updateClient.httpClient.retrieveAllPages = sinon.spy();

      // When / Then
      updateClient.getUpdatesBySegmentId(token, segmentId).then(result => {
        expect(result).to.be.instanceOf(PageableStream);
        expect(updateClient.httpClient.retrieveAllPages).to.have.been.calledOnce;
        expect(updateClient.httpClient.retrieveAllPages).to.have.been.calledWithExactly(
          new PageableStream(),
          'updatesBySegmentId',
          options,
          'updates'
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateClient.publishUpdate(token, updateId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('publishUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      updateClient.publishUpdate(token, updateId).then(result => {
        expect(result).to.be.equals(update);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('publishUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(error));

      // When / Then
      updateClient.archiveUpdate(token, updateId).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error.message);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('archiveUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      updateClient.archiveUpdate(token, updateId).then(result => {
        expect(result).to.be.equals(update);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('archiveUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      updateClient.scheduleUpdate(token, uuid, date).then(result => {
        expect(result).to.be.equals(update);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('scheduleUpdate', {
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
      updateClient.httpClient.sendEndpointRequest = sinon.stub().returns(Promise.reject(response));

      // When / Then
      updateClient.scheduleUpdate(token, uuid, date).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledOnce;
        expect(updateClient.httpClient.sendEndpointRequest).to.have.been.calledWithExactly('scheduleUpdate', {
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
});