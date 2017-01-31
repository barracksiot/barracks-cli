const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const USER_CONFIGURATION_FILE_NAME = 'barracks.json';

function initUserConfigurationFileIfDoesNotExist(userConfiguration) {
  return new Promise((resolve, reject) => {
    fs.exists(userConfiguration.userConfigurationFile, (exists) => {
      if (!exists) {
        userConfiguration.initUserConfigurationFile().then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      } else {
        resolve();
      }
    });
  });
}

class UserConfiguration {

  constructor(options) {
    this.userConfigurationFile = path.join(
      options.folder,
      USER_CONFIGURATION_FILE_NAME
    );
    this.userConfigurationFolder = options.folder;
  }

  saveAuthenticationToken(token) {
    return new Promise((resolve, reject) => {
      this.readUserConfiguration().then(config => {
        config.token = token;
        return this.writeUserConfiguration(config);
      }).then(() => {
        resolve(token);
      }).catch(err => {
        reject(err);
      });
    });
  }

  initUserConfigurationFile() {
    return this.writeUserConfiguration({});
  }

  readUserConfiguration() {
    const that = this;
    return new Promise((resolve, reject) => {
      mkdirp(that.userConfigurationFolder, (err) => {
        if (err) {
          reject(err);
        } else {
          initUserConfigurationFileIfDoesNotExist(that).then(() => {
            fs.readFile(that.userConfigurationFile, 'utf8', (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(JSON.parse(data));
              }
            });
          }).catch(err => {
            reject(err);
          });
        }
      });
    });
  }

  getAuthenticationToken() {
    const that = this;
    return new Promise((resolve, reject) => {
      that.readUserConfiguration().then(config => {
        resolve(config.token);
      }).catch(err => {
        reject(err);
      });
    });
  }

  writeUserConfiguration(config) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.userConfigurationFile, JSON.stringify(config), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

}

module.exports = UserConfiguration;