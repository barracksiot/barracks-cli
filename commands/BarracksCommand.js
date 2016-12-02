const prettyRenderer = require('../renderers/prettyRenderer');
const jsonRenderer = require('../renderers/jsonRenderer');
const program = require('commander');
const read = require('read');
const Barracks = require('../clients/Barracks');
const UserConfiguration = require('../repositories/UserConfiguration');
const config = require('../config');

class BarracksCommand {

  constructor() {
    this.configureCommand(program)
      .option('--json', 'Format result in json')
      .parse(process.argv);
    this.userConfiguration = new UserConfiguration(config.userConfig);
    this.barracks = new Barracks(config.barracks);
  }

  configureCommand(program) {
    return program;
  }

  getAuthenticationToken() {
    return new Promise((resolve, reject) => {
      let token;
      this.userConfiguration.getAuthenticationToken().then(authToken => {
        token = authToken;
        return this.barracks.getAccount(token);
      }).then(() => {
        resolve(token);
      }).catch(err => {
        this.requestUserAuthentication().then(credentials => {
          return this.authenticate(credentials.email, credentials.password);
        }).then(token => {
          resolve(token);
        }).catch(err => {
          reject(err);
        });
      });
    });
  }

  requestUserAuthentication() {
    return new Promise((resolve, reject) => {
      read({ prompt: 'Account e-mail: ' }, (err, email) => {
        if (err) {
          reject(err);
        } else {
          resolve(email);
        }
      });
    }).then(email => {
      return new Promise((resolve, reject) => {
        read({ prompt: 'Password: ', silent: true }, (err, password) => {
          if (err) {
            reject(err);
          } else {
            resolve({ email, password });
          }
        });
      });
    });
  }

  authenticate(email, password) {
    return new Promise((resolve, reject) => {
      this.barracks.authenticate(email, password).then(token => {
        return this.saveAuthenticationToken(token);
      }).then(token => {
        resolve(token);
      }).catch(err => {
        reject(err);
      });
    });
  }

  saveAuthenticationToken(token) {
    return this.userConfiguration.saveAuthenticationToken(token);
  }

  validateCommand(program) {
    return true;
  }

  execute(program) {
    return Promise.reject('Need to be overridden');
  }

  render() {
    if (this.validateCommand(program)) {
      const result = this.execute(program);
      if (program.json) {
        jsonRenderer(result);
      } else {
        prettyRenderer(result);
      }
    } else {
      console.error('Mandatory arguments are missing. Use --help for more information.');
    }
  }

}

module.exports = BarracksCommand;