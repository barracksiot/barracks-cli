const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateUpdateCommand', () => {

  let createUpdateCommand;
  let proxyIsJsonString;
  let proxyFileExists;

  const CreateUpdateCommand = proxyquire('../../../src/commands/update/CreateUpdateCommand', {
    '../../utils/Validator': {
      isJsonString: (str) => {
        return proxyIsJsonString(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }
  });

  const token = 'i8uhkj.token.65ryft';
  const programWithValidOptions = {
    title: 'Title',
    description: 'Description',
    versionId: 'Version id',
    properties: JSON.stringify({ coucou: 'Plop' }),
    'package': __filename,
    segment: 'Production'
  };

  before(() => {
    createUpdateCommand = new CreateUpdateCommand();
    createUpdateCommand.barracks = {};
    createUpdateCommand.userConfiguration = {};
    proxyIsJsonString = undefined;
    roxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return true when all the options are present', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (str) => {
        spyIsJsonString(str);
        return true;
      }

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(programWithValidOptions.package);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(programWithValidOptions.properties);
    });

    it('should return false when the title is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { title: undefined });
      // When
      const result = createUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when the description is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { description: undefined });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (str) => {
        spyIsJsonString(str);
        return true;
      }

      // When
      const result = createUpdateCommand.validateCommand(program);
      
      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(programWithValidOptions.package);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(programWithValidOptions.properties);
    });

    it('should return false when the versionId is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { versionId: undefined });
      // When
      const result = createUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return true when the properties are missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { properties: undefined });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(programWithValidOptions.package);
    });

    it('should return false when the properties are not in valid JSON format', () => {
      // Given
      const properties = 'pl{op:plop}';
      const program = Object.assign({}, programWithValidOptions, { properties });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonString = sinon.spy();
      proxyIsJsonString = (str) => {
        spyIsJsonString(str);
        return false;
      }

      // When
      const result = createUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(programWithValidOptions.package);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(properties);
    });

    it('should return false when the package is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { 'package': undefined });
      // When
      const result = createUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when the package is not a valid path', () => {
      // Given
      package = '@ws5r';
      const program = Object.assign({}, programWithValidOptions, { package });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createUpdateCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(package);
    });

    it('should return false when the segment is missing', () => {
      // Given
      const program = Object.assign({}, programWithValidOptions, { segment: undefined });
      // When
      const result = createUpdateCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });
  });

  describe('#execute(program)', () => {

    const updatePackage = {
      id: 'PackageID'
    };

    const segment = {
      id: 'SegmentId',
      name: programWithValidOptions.segment
    };

    const account = {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Plop and Cie',
      phone: '1234567890',
      id: '57c068',
      email: 'john@doe.com',
      apiKey: 'da9d4d6a47547c8ed313fee8',
      status: 'active' 
    };

    it('should return an error when the get segment request failed', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.userConfiguration.getAuthenticationToken).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        done();
      });
    });

    it('should return an error when the create package request failed', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        createUpdatePackage: sinon.stub().returns(Promise.reject('Error'))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        done();
      });
    });

    it('should return an error when the create update request failed', done => {
      // Given
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        createUpdatePackage: sinon.stub().returns(Promise.resolve(updatePackage)),
        createUpdate: sinon.stub().returns(Promise.reject("Error"))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledWithExactly(token, {
          packageId: updatePackage.id,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          segmentId: segment.id
        });
        done();
      });
    });

    it('should return the created update when the create update request is successful', done => {
      // Given
      const update = {
        uuid: 'bc354c98-bc73-4f90-9eeb-9c1698b988bc'
      };
      const program = Object.assign({}, programWithValidOptions);
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        createUpdatePackage: sinon.stub().returns(Promise.resolve(updatePackage)),
        createUpdate: sinon.stub().returns(Promise.resolve(update))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledWithExactly(token, {
          packageId: updatePackage.id,
          name: program.title,
          description: program.description,
          additionalProperties: JSON.parse(program.properties),
          segmentId: segment.id
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should return the created update (with no custom data) when the create update request is successful', done => {
      // Given
      const update = {
        uuid: 'bc354c98-bc73-4f90-9eeb-9c1698b988bc'
      };
      const program = Object.assign({}, programWithValidOptions, { properties: undefined });
      createUpdateCommand.userConfiguration = {
        getAuthenticationToken: sinon.stub().returns(Promise.resolve(token))
      };
      createUpdateCommand.barracks = {
        getAccount: sinon.stub().returns(Promise.resolve(account)),
        getSegmentByName: sinon.stub().returns(Promise.resolve(segment)),
        createUpdatePackage: sinon.stub().returns(Promise.resolve(updatePackage)),
        createUpdate: sinon.stub().returns(Promise.resolve(update))
      };

      // When / Then
      createUpdateCommand.execute(program).then(result => {
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getAccount).to.have.been.calledWithExactly(token);
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.getSegmentByName).to.have.been.calledWithExactly(token, program.segment);
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdatePackage).to.have.been.calledWithExactly(token, {
          file: program.package,
          versionId: program.versionId
        });
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledOnce;
        expect(createUpdateCommand.barracks.createUpdate).to.have.been.calledWithExactly(token, {
          packageId: updatePackage.id,
          name: program.title,
          description: program.description,
          additionalProperties: {},
          segmentId: segment.id
        });
        done();
      }).catch(err => {
        done(err);
      });
    });

  });

});