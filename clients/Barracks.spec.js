const PageableStream = require('../clients/PageableStream');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const Barracks = require('./Barracks');

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
        done('should have succeeded');
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
        done('should have succeeded');
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
    /*

    it('should return an error message when request fails', done => {
      // Given
      const error = { message: 'Error !' };
      barracks.client.retrieveAllPages = sinon.stub().returns(Promise.reject(error));

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
        done('should have succeeded');
      });
    });
    */
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
        done('should have succeeded');
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
      const response = [
        { id: 'zxcvbnm', name: 'segment' },
        { id: 'zxcvbnm', name: 'other segment' }
      ];
      barracks.getSegments = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      barracks.getSegmentByName(token, segmentName).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.not.be.undefined;
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

  describe('#getDevices()', () => {
  });

  describe('#getDeviceEvents()', () => {
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

});