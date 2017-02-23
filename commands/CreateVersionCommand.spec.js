const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CreateVersionCommand', () => {

  let createVersionCommand;
  let proxyIsJsonString;
  let proxyFileExists;

  const CreateVersionCommand = proxyquire('./CreateVersionCommand', {
    '../utils/Validator': {
      isJsonString: (str) => {
        return proxyIsJsonString(str);
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
  const minimalValidProgram = { versionId, name, packageReference, file };
  const programWithDescription = { versionId, name, packageReference, file, description };
  const programWithMetadata = { versionId, name, packageReference, file, metadata: JSON.stringify(metadata) };
  const programWithDescriptionAndMetadata = { versionId, name, packageReference, file, description, metadata: JSON.stringify(metadata) };

  before(() => {
    createVersionCommand = new CreateVersionCommand();
    createVersionCommand.barracks = {};
    createVersionCommand.userConfiguration = {};
    proxyIsJsonString = undefined;
    roxyFileExists = undefined;
  });

  describe('#validateCommand(program)', () => {

    it('should return false when no option given', () => {
      // Given
      const program = {};
      // When
      const result = createVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only versionId option given', () => {
      // Given
      const program = { versionId };
      // When
      const result = createVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only name option given', () => {
      // Given
      const program = { name };
      // When
      const result = createVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only packageReference option given', () => {
      // Given
      const program = { packageReference };
      // When
      const result = createVersionCommand.validateCommand(program);
      // Then
      expect(result).to.be.false;
    });

    it('should return false when only file option given', () => {
      // Given
      const program = { packageReference };
      // When
      const result = createVersionCommand.validateCommand(program);
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
      const result = createVersionCommand.validateCommand(program);

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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when minimum option given and empty description', () => {
      // Given
      const program = Object.assign({}, minimalValidProgram, { description: true });
      const spyFileExists = sinon.spy();
      proxyFileExists = (path) => {
        spyFileExists(path);
        return true;
      }

      // When
      const result = createVersionCommand.validateCommand(program);

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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
    });

    it('should return false when minimum option given and empty metadata', () => {
      // Given
      const program = Object.assign({}, minimalValidProgram, { metadata: true });
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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(true);
    });

    it('should return true when minimum option and invalid metadata given', () => {
      // Given
      const invalidMetadata = '{bhvgcfdghjklm,nbvcg';
      const program = Object.assign({}, minimalValidProgram, { metadata: invalidMetadata });
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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.false;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(invalidMetadata);
    });

    it('should return true when minimum option and valid metadata given', () => {
      // Given
      const program = programWithMetadata;
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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(JSON.stringify(metadata));
    });

    it('should return true when all valid options given', () => {
      // Given
      const program = programWithDescriptionAndMetadata;
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
      const result = createVersionCommand.validateCommand(program);

      // Then
      expect(result).to.be.true;
      expect(spyFileExists).to.have.been.calledOnce;
      expect(spyFileExists).to.have.been.calledWithExactly(file);
      expect(spyIsJsonString).to.have.been.calledOnce;
      expect(spyIsJsonString).to.have.been.calledWithExactly(JSON.stringify(metadata));
    });
  });

  describe('#execute(program)', () => {

    it('should reject an error if creation request fail', done => {
      // Given
      const program = minimalValidProgram;
      const componentId = '09876543sdfghjkl';
      const component = { name: packageReference, id: componentId };
      const error = 'creation failed';
      createVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.reject(error));

      // When / Then
      createVersionCommand.execute(program).then(result => {
        done('Should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token,
          {
            id: versionId,
            name,
            component: packageReference,
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
      const componentId = '09876543sdfghjkl';
      const component = { name: packageReference, id: componentId };
      const response = { id: 'wertyui', component: packageReference };
      createVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createVersionCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token,
          {
            id: versionId,
            name,
            component: packageReference,
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
      const componentId = '09876543sdfghjkl';
      const component = { name: packageReference, id: componentId };
      const response = { id: 'wertyui', component: packageReference };
      createVersionCommand.getAuthenticationToken = sinon.stub().returns(Promise.resolve(token));
      createVersionCommand.barracks.createVersion = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      createVersionCommand.execute(program).then(result => {
        expect(result).to.be.equals(response);
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledOnce;
        expect(createVersionCommand.getAuthenticationToken).to.have.been.calledWithExactly();
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledOnce;
        expect(createVersionCommand.barracks.createVersion).to.have.been.calledWithExactly(
          token,
          {
            id: versionId,
            name,
            component: packageReference,
            file,
            description,
            metadata: JSON.stringify(metadata)
          }
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});