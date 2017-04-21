const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreatePackageVersionCommand', () => {

  let createPackageVersionCommand;
  let proxyIsJsonObject;
  let proxyFileExists;

  const CreatePackageVersionCommand = proxyquire('../../../src/commands/package/CreatePackageVersionCommand', {
    '../../utils/Validator': {
      isJsonObject: (str) => {
        return proxyIsJsonObject(str);
      },
      fileExists: (path) => {
        return proxyFileExists(path);
      }
    }
  });

  const token = 'edcbhjuijm,l';
  const versionId = '2.3.4';
  const name = 'version 2';
  const packageReference = 'com.package.ref';
  const file = 'path/to/my/package/version.tar.gz';
  const description = 'The is the description of the version for my package';
  const metadata = {
    data1: 'value1',
    data2: 'value2',
  };
  const minimalValidProgram = {
    versionId,
    name,
    packageReference,
    file
  };
  const programWithDescription = {
    versionId,
    name,
    packageReference,
    file,
    description
  };
  const programWithMetadata = {
    versionId,
    name,
    packageReference,
    file,
    metadata: JSON.stringify(metadata)
  };
  const programWithDescriptionAndMetadata = {
    versionId,
    name,
    packageReference,
    file,
    description,
    metadata: JSON.stringify(metadata)
  };

  before(() => {
    createPackageVersionCommand = new CreatePackageVersionCommand();
    createPackageVersionCommand.barracks = {};
    createPackageVersionCommand.userConfiguration = {};
    proxyIsJsonObject = undefined;
    roxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = createPackageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only versionId option given', () => {
      // Given
      const program = {
        versionId
      };
      // When
      const result = createPackageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only name option given', () => {
      // Given
      const program = {
        name
      };
      // When
      const result = createPackageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only packageReference option given', () => {
      // Given
      const program = {
        packageReference
      };
      // When
      const result = createPackageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only file option given', () => {
      // Given
      const program = {
        packageReference
      };
      // When
      const result = createPackageVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when minimal options given but file do not exists', () => {
      // Given
      const program = minimalValidProgram;
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return false;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return true when minimal options given, and file exists', () => {
      // Given
      const program = minimalValidProgram;
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when minimum option given and empty description', () => {
      // Given
      const program = Object.assign({}, minimalValidProgram, {
        description: true
      });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return true when minimum option and description given', () => {
      // Given
      const program = programWithDescription;
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when minimum option given and empty metadata', () => {
      // Given
      const program = Object.assign({}, minimalValidProgram, {
        metadata: true
      });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return false;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(true);
    });

    it('should return true when minimum option and invalid metadata given', () => {
      // Given
      const invalidMetadata = '{bhvgcfdghjklm,nbvcg';
      const program = Object.assign({}, minimalValidProgram, {
        metadata: invalidMetadata
      });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return false;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(invalidMetadata);
    });

    it('should return true when minimum option and valid metadata given', () => {
      // Given
      const program = programWithMetadata;
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return true;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(JSON.stringify(metadata));
    });

    it('should return true when all valid options given', () => {
      // Given
      const program = programWithDescriptionAndMetadata;
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }
      const spyIsJsonObject = sinon.spy();
      proxyIsJsonObject = (str) => {
        spyIsJsonObject(str);
        return true;
      }

      // When
      const result = createPackageVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonObject).to.have.been.calledOnce;
      expect(spyIsJsonObject).to.have.been.calledWithExactly(JSON.stringify(metadata));
    });
  });

  describe('#execute(program)', () => {

    it('should reject an error if creation request fail', done => {
      // Given
      const program = minimalValidProgram;
      const packageId = '09876543sdfghjkl';
      const aPackage = {
        name: packageReference,
        id: packageId
      };
      const error = 'creation failed';
      createPackageVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createPackageVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.reject(error));

      // When / Then
      createPackageVersionCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token, {
            id: versionId,
            name,
            packageRef: packageReference,
            file,
            description: undefined,
            metadata: undefined
          }
        );
        done();
      });
    });

    it('should forward to barracks client when minimal options given', done => {
      // Given
      const program = minimalValidProgram;
      const packageId = '09876543sdfghjkl';
      const aPackage = {
        name: packageReference,
        id: packageId
      };
      const response = {
        id: 'wertyui',
        packageRef: packageReference
      };
      createPackageVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createPackageVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createPackageVersionCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token, {
            id: versionId,
            name,
            packageRef: packageReference,
            file,
            description: undefined,
            metadata: undefined
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should forward to barracks client when all options given', done => {
      // Given
      const program = programWithDescriptionAndMetadata;
      const packageId = '09876543sdfghjkl';
      const aPackage = {
        name: packageReference,
        id: packageId
      };
      const response = {
        id: 'wertyui',
        packageRef: packageReference
      };
      createPackageVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createPackageVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createPackageVersionCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createPackageVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createPackageVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token, {
            id: versionId,
            name,
            packageRef: packageReference,
            file,
            description,
            metadata: metadata
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});
