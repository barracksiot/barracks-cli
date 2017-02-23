const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const UserConfiguration = require('./UserConfiguration');
const proxyquire = require('proxyquire').noCallThru();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UserConfiguration', () => {

  let userConfiguration;
  const configurationOption = {
    folder: 'path/to/folder'
  };
  const userConfigurationFile = 'path/to/folder/file.json';
  const accountPassword = 'guest';
  const token = 's5d6f.657fgyi.d6tfuyg';

  function resetConfiguration() {
    userConfiguration = new UserConfiguration(configurationOption);
  }

  describe('#saveAuthenticationToken()', () => {

    before(() => {
      resetConfiguration();
    });

    it('should return an error when readUserConfiguration fail', done => {
      // Given
      const error = 'Error with readUserConfiguration';
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.reject(error));

      // When / Then
      userConfiguration.saveAuthenticationToken(token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        done();
      });
    });

    it('should return an error when writeUserConfiguration fail', done => {
      // Given
      const error = 'Error with readUserConfiguration';
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.resolve({ token }));
      userConfiguration.writeUserConfiguration = sinon.stub().returns(Promise.reject(error));

      // When / Then
      userConfiguration.saveAuthenticationToken(token).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledWithExactly({ token });
        done();
      });
    });

    it('should return a token when no error', done => {
      // Given
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.resolve({ token }));
      userConfiguration.writeUserConfiguration = sinon.stub().returns(Promise.resolve());

      // When / Then
      userConfiguration.saveAuthenticationToken(token).then(result => {
        expect(result).to.be.equals(token);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledWithExactly({ token });
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });
  });

  describe('#initUserConfigurationFile()', () => {
    before(() => {
      resetConfiguration();
    });

    it('should call writeUserConfiguration', done => {
      // Given
      const response = { data: 'ok cool' };
      userConfiguration.writeUserConfiguration = sinon.stub().returns(Promise.resolve(response));

      // When / Then
      userConfiguration.initUserConfigurationFile().then(result => {
        expect(result).to.be.equals(response);
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.writeUserConfiguration).to.have.been.calledWithExactly({});
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });
  });

  describe('#readUserConfiguration()', () => {

    let proxyMkdrip = undefined;
    let proxyFsExists = undefined;
    let proxyFsReadFile = undefined;
    const ProxyUserConfiguration = proxyquire('./UserConfiguration', {
      mkdirp: (folder, callback) => {
        proxyMkdrip(folder, callback)
      },
      fs: {
        exists: (file, callback) => {
          proxyFsExists(file, callback);
        },
        readFile: (file, encoding, callback) => {
          proxyFsReadFile(file, encoding, callback);
        }
      }
    });

    const proxyUserConfiguration = new ProxyUserConfiguration(configurationOption);
    proxyUserConfiguration.userConfigurationFile = userConfigurationFile;

    it('should fail if folder cannot be created', done => {
      // Given
      const error = 'Folder cannot be created';
      const mkdripSpy = sinon.spy();
      proxyMkdrip = (folder, callback) => {
        mkdripSpy(folder, callback);
        callback(error);
      };

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(mkdripSpy).to.have.been.calledOnce;
        expect(mkdripSpy).to.have.been.calledWithExactly(
          configurationOption.folder,
          sinon.match.func
        );
        done();
      });
    });

    it('should fail if file init fail', done => {
      // Given
      const error = 'File cannot be created';
      const mkdripSpy = sinon.spy();
      proxyMkdrip = (folder, callback) => {
        mkdripSpy(folder, callback);
        callback();
      };
      const fsExistsSpy = sinon.spy();
      proxyFsExists = (file, callback) => {
        fsExistsSpy(file, callback);
        callback(false);
      };

      proxyUserConfiguration.initUserConfigurationFile = sinon.stub().returns(Promise.reject(error));

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(mkdripSpy).to.have.been.calledOnce;
        expect(mkdripSpy).to.have.been.calledWithExactly(
          configurationOption.folder,
          sinon.match.func
        );
        expect(fsExistsSpy).to.have.been.calledOnce;
        expect(fsExistsSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          sinon.match.func
        );
        done();
      });
    });

    it('should create new file if config file does not exists yet and return empty object', done => {
      // Given
      const data = {};
      const mkdripSpy = sinon.spy();
      proxyMkdrip = (folder, callback) => {
        mkdripSpy(folder, callback);
        callback();
      };
      const fsExistsSpy = sinon.spy();
      proxyFsExists = (file, callback) => {
        fsExistsSpy(file, callback);
        callback(false);
      };
      const fsReadFileSpy = sinon.spy();
      proxyFsReadFile = (file, encoding, callback) => {
        fsReadFileSpy(file, encoding, callback);
        callback(undefined, JSON.stringify(data));
      };

      proxyUserConfiguration.initUserConfigurationFile = sinon.stub().returns(Promise.resolve());

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        expect(JSON.stringify(result)).to.be.equals(JSON.stringify(data));
        expect(mkdripSpy).to.have.been.calledOnce;
        expect(mkdripSpy).to.have.been.calledWithExactly(
          configurationOption.folder,
          sinon.match.func
        );
        expect(fsExistsSpy).to.have.been.calledOnce;
        expect(fsExistsSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          sinon.match.func
        );
        expect(fsReadFileSpy).to.have.been.calledOnce;
        expect(fsReadFileSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          'utf8',
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should read content of user config file and returns it content when file already exists', done => {
      // Given
      const data = {};
      const mkdripSpy = sinon.spy();
      proxyMkdrip = (folder, callback) => {
        mkdripSpy(folder, callback);
        callback();
      };
      const fsExistsSpy = sinon.spy();
      proxyFsExists = (file, callback) => {
        fsExistsSpy(file, callback);
        callback(true);
      };
      const fsReadFileSpy = sinon.spy();
      proxyFsReadFile = (file, encoding, callback) => {
        fsReadFileSpy(file, encoding, callback);
        callback(undefined, JSON.stringify(data));
      };

      proxyUserConfiguration.initUserConfigurationFile = sinon.stub().returns(Promise.resolve());

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        expect(JSON.stringify(result)).to.be.equals(JSON.stringify(data));
        expect(mkdripSpy).to.have.been.calledOnce;
        expect(mkdripSpy).to.have.been.calledWithExactly(
          configurationOption.folder,
          sinon.match.func
        );
        expect(fsExistsSpy).to.have.been.calledOnce;
        expect(fsExistsSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          sinon.match.func
        );
        expect(fsReadFileSpy).to.have.been.calledOnce;
        expect(fsReadFileSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          'utf8',
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('should reject an error if unable to read user config file', done => {
      // Given
      const error = 'a marche po';
      const mkdripSpy = sinon.spy();
      proxyMkdrip = (folder, callback) => {
        mkdripSpy(folder, callback);
        callback();
      };
      const fsExistsSpy = sinon.spy();
      proxyFsExists = (file, callback) => {
        fsExistsSpy(file, callback);
        callback(true);
      };
      const fsReadFileSpy = sinon.spy();
      proxyFsReadFile = (file, encoding, callback) => {
        fsReadFileSpy(file, encoding, callback);
        callback(error);
      };

      proxyUserConfiguration.initUserConfigurationFile = sinon.stub().returns(Promise.resolve());

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(mkdripSpy).to.have.been.calledOnce;
        expect(mkdripSpy).to.have.been.calledWithExactly(
          configurationOption.folder,
          sinon.match.func
        );
        expect(fsExistsSpy).to.have.been.calledOnce;
        expect(fsExistsSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          sinon.match.func
        );
        expect(fsReadFileSpy).to.have.been.calledOnce;
        expect(fsReadFileSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          'utf8',
          sinon.match.func
        );
        done();
      });
    });
  });

  describe('#getAuthenticationToken()', () => {

    before(() => {
      resetConfiguration();
    });

    it('should return an error if config cannot be read', done => {
      // Given
      const error = 'Cannot read';
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.reject(error));

      // When / Then
      userConfiguration.getAuthenticationToken().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        done();
      });
    });

    it('should return token when it exists', done => {
      // Given
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.resolve({ token }));

      // When / Then
      userConfiguration.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done(err);
      });
    });
  });

  describe('#writeUserConfiguration()', () => {

    let proxyFsWriteFile = undefined;
    const ProxyUserConfiguration = proxyquire('./UserConfiguration', {
      fs: {
        writeFile: (file, encoding, callback) => {
          proxyFsWriteFile(file, encoding, callback);
        }
      }
    });

    const proxyUserConfiguration = new ProxyUserConfiguration(configurationOption);
    proxyUserConfiguration.userConfigurationFile = userConfigurationFile;

    it('should reject an error if write in file fail', done => {
      // Given
      const config = { token: 'aToken' };
      const error = 'Unable to write file';
      const fsWriteFileSpy = sinon.spy();
      proxyFsWriteFile = (file, data, callback) => {
        fsWriteFileSpy(file, data, callback);
        callback(error);
      };

      // When / Then
      proxyUserConfiguration.writeUserConfiguration(config).then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        expect(fsWriteFileSpy).to.have.been.calledOnce;
        expect(fsWriteFileSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          JSON.stringify(config),
          sinon.match.func
        );
        done();
      });
    });

    it('should write given config in file', done => {
      // Given
      const config = { token: 'aToken' };
      const fsWriteFileSpy = sinon.spy();
      proxyFsWriteFile = (file, data, callback) => {
        fsWriteFileSpy(file, data, callback);
        callback();
      };

      // When / Then
      proxyUserConfiguration.writeUserConfiguration(config).then(result => {
        expect(result).to.be.equals(undefined);
        expect(fsWriteFileSpy).to.have.been.calledOnce;
        expect(fsWriteFileSpy).to.have.been.calledWithExactly(
          userConfigurationFile,
          JSON.stringify(config),
          sinon.match.func
        );
        done();
      }).catch(err => {
        done(err);
      });
    });
  });
});