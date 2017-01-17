const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const UserConfiguration = require('./UserConfiguration');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('UserConfiguration', () => {

  let userConfiguration;
  const configurationOption = {
    folder: 'path/to/folder'
  };
  const accountPassword = 'guest';
  const token = 's5d6f.657fgyi.d6tfuyg';

  function resetConfiguration() {
    userConfiguration = new UserConfiguration(configurationOption);
  }

  describe('#saveAuthenticationToken()', () => {

    before(() => {
      resetConfiguration();
    });

    it('should return an error when readUserConfiguration fail', (done) => {
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

    it('should return an error when writeUserConfiguration fail', (done) => {
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

    it('should return a token when no error', (done) => {
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

    it('should call writeUserConfiguration', (done) => {
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
/*
  describe('#readUserConfiguration()', () => {

    it('should fail if folder cannot be created', (done) => {
      // Given
      const error = 'Folder cannot be created';
      proxyquire('./UserConfiguration', {
        // 'fs': {
        //   unlink: function (file, callback) {
        //     unlinkMock(file, callback);
        //   }
        // },
        mkdirp: function (folder, callback) {
          callback(error);
        }
      });

      ProxyUserConfiguration = require('./UserConfiguration');
      proxyUserConfiguration = new ProxyUserConfiguration(configurationOption);

      // When / Then
      proxyUserConfiguration.readUserConfiguration().then(result => {
        done('should have failed');
      }).catch(err => {
        expect(err).to.be.equals(error);
        done();
      });
    });
  });
*/

  describe('#getAuthenticationToken()', () => {
    before(() => {
      resetConfiguration();
    });

    it('should return an error if config cannot be read', (done) => {
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

    it('should return token when it exists', (done) => {
      // Given
      userConfiguration.readUserConfiguration = sinon.stub().returns(Promise.resolve({ token }));

      // When / Then
      userConfiguration.getAuthenticationToken().then(result => {
        expect(result).to.be.equals(token);
        expect(userConfiguration.readUserConfiguration).to.have.been.calledOnce;
        expect(userConfiguration.readUserConfiguration).to.have.been.calledWithExactly();
        done();
      }).catch(err => {
        done('should have succeeded');
      });
    });
  });
/*
  describe('#writeUserConfiguration()', () => {
    before(() => {
      resetConfiguration();
    });
  });
  */
});