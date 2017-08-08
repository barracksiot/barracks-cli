const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();
const ObjectReader = require('../../../src/utils/ObjectReader');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateHookCommand', () => {

  let createHookCommand;
  let proxyIsJsonObject;
  let proxyFileExists;
  let proxyReadObjectFromFile;
  let proxyReadObjectFromStdin;

  const CreateHookCommand = proxyquire('../../../src/commands/hook/CreateHookCommand', {
    '../../utils/Validator': {
      isJsonObject: (str) => {
        return proxyIsJsonObject(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }, 
    '../../utils/ObjectReader': {
      readObjectFromFile: (file) => {
        return proxyReadObjectFromFile(file);
      },
      readObjectFromStdin: () => {
        return proxyReadObjectFromStdin();
      }
    }
  });

  const file = 'path/to/file.json';
  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    ping: true,
    web: true,
    name: 'HookName',
    url: 'https://not.barracks.io'
  };
  const createdHook = {
    type: 'web',
    name: 'HookName',
    url: 'https://not.barracks.io',
    userId: '12345'
  };

  const validSecret = {
    web: {
      client_id: 'aRandomClientId',
      project_id: 'aRandomProjectId',
      auth_uri: 'aRandomAuthenticationURI',
      token_uri: 'aRandomTokenURI',
      client_secret: 'aRandomClientSecret'
    }
  };

  before(() => {
    createHookCommand = new CreateHookCommand();
    createHookCommand.barracks = {};
    createHookCommand.userConfiguration = {};
    proxyIsJsonObject = undefined;
    roxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are valid and present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);

      // When
      const result = createHookCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
    });

    it('should return false when type is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web: false });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when name is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { name: undefined });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when event type is ping', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when event type is enrollment', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, enrollment: true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when event type is deviceDataChange', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, deviceDataChange:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return true when event type is devicePackageChange', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, devicePackageChange:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });


    it('should return false when event type is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: undefined });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when ping and enrollment', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: true, enrollment:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when ping and deviceDataChange', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: true, deviceDataChange:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when enrollment and deviceDataChange', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping:false, enrollment: true, deviceDataChange:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when devicePackageChange and deviceDataChange', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping:false, deviceDataChange: true, devicePackageChange:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when web and GA', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:true, googleAnalytics: true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when web and BQ', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:true, bigquery: true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when GA and BQ', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:false, googleAnalytics:true, bigquery: true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when googleAnalytics hook with all arguments', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:false, url:undefined, googleAnalytics:true, gaTrackingId:'UA-12453453-23' });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
    });

    it('should return false when googleAnalytics without trackingId', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:false, url:undefined, googleAnalytics:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when bigquery hook with all arguments and valid file path', () => {
      // Given
      const spyFileExists = sinon.spy();
      proxyFileExists = (file) => {
        spyFileExists(file);
        return true;
      };
      const program = Object.assign({}, programWithValidOptions, { web:false, url:undefined, bigquery:true, googleClientSecret: file });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when bigquery hook with all arguments and invalid file path', () => {
      // Given
      const spyFileExists = sinon.spy();
      proxyFileExists = (file) => {
        spyFileExists(file);
        return false;
      };
      const program = Object.assign({}, programWithValidOptions, { web:false, url:undefined, bigquery:true, googleClientSecret: file });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when bigquery without googleClientSecret', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web:false, url:undefined, bigquery:true });
      // When
      const result = createHookCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

  });

  describe('#execute(program)', () => {

    it('should return the created hook when the request was successful and event type is ping', done => {
      // Given
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(programWithValidOptions).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'PING',
          type: 'web',
          name: programWithValidOptions.name,
          url: programWithValidOptions.url,
          gaTrackingId: undefined,
          googleClientSecret: undefined
      });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created hook when the request was successful and event type is enrollment', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, enrollment:true });
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'ENROLLMENT',
          type: 'web',
          name: program.name,
          url: program.url,
          gaTrackingId: undefined,
          googleClientSecret: undefined
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created hook when the request was successful and event type is deviceDataChange', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, deviceDataChange:true });
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'DEVICE_DATA_CHANGE',
          type: 'web',
          name: program.name,
          url: program.url,
          gaTrackingId: undefined,
          googleClientSecret: undefined
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created hook when the request was successful and event type is devicePackageChange', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { ping: false, devicePackageChange:true });
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'DEVICE_PACKAGE_CHANGE',
          type: 'web',
          name: program.name,
          url: program.url,
          gaTrackingId: undefined,
          googleClientSecret: undefined
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created hook when the request was successful and hook type is google analytics', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { web: false, googleAnalytics: true, gaTrackingId: 'UA-12453453-23' });
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'PING',
          type: 'google_analytics',
          name: programWithValidOptions.name,
          url: programWithValidOptions.url,
          gaTrackingId: 'UA-12453453-23',
          googleClientSecret: undefined
      });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created hook when the request was successful and hook type is bigQuery', done => {
      // Given
      const spyReadObjectFromFile = sinon.spy();
      proxyReadObjectFromFile = (file) => {
        spyReadObjectFromFile(file);
        return validSecret;
      };

      const program = Object.assign({}, programWithValidOptions, { web: false, bigquery: true, googleClientSecret: file });
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.resolve(createdHook))
      };

      // When / Then
      createHookCommand.execute(program).then(result => {
        expect(result).to.be.equals(createdHook);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
          eventType: 'PING',
          type: 'bigquery',
          name: program.name,
          url: program.url,
          gaTrackingId: undefined,
          googleClientSecret: validSecret
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return error when the request failed', done => {
      // Given
      const spyReadObjectFromFile = sinon.spy();
      proxyReadObjectFromFile = (file) => {
        spyReadObjectFromFile(file);
        return undefined;
      };

      const error = 'Marche pas!!!';
      createHookCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createHookCommand.barracks = {
        createHook: sinon.stub().returns(Promise.reject(error))
      };

      // When / Then
      createHookCommand.execute(programWithValidOptions).then(result => {
        done('Should have failed');
      }).catch(err => {
        try {
          expect(err).to.be.equals(error);
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createHookCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createHookCommand.barracks.createHook).to.have.been.calledOnce;
        expect(createHookCommand.barracks.createHook).to.have.been.calledWithExactly(token, {
            eventType: 'PING',
            type: 'web',
            name: programWithValidOptions.name,
            url: programWithValidOptions.url,
            gaTrackingId: undefined,
            googleClientSecret: undefined
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });
});