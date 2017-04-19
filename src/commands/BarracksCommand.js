const prettyRenderer = require('../renderers/prettyRenderer');
const jsonRenderer = require('../renderers/jsonRenderer');
const read = require('read');
const program = require('commander');
const Barracks = require('../clients/BarracksClient');
const UserConfiguration = require('../repositories/UserConfiguration');
const config = require('../config');
const os = require('os');

const TOKEN_LABEL_MAX_LENGTH = 50;

function buildTokenLabel() {
  const hostname = os.hostname();
  const user = os.userInfo().username;
  return `${user}@${hostname}`.substring(0, TOKEN_LABEL_MAX_LENGTH);
}

class BarracksCommand {

  constructor() {
    this.experimental = config.experimental;
    this.v2Enabled = config.v2Enabled;
    this.userConfiguration = new UserConfiguration(config.userConfig);
    this.barracks = new Barracks();
    this.configureCommand(program)
      .option('--json', 'Format result in json')
      .parse(process.argv);
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
      }).catch(() => {
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
      this.barracks.authenticate(email, password).then(authToken => {
        return this.barracks.createToken(authToken, { label: buildTokenLabel() });
      }).then(apiToken => {
        return this.saveAuthenticationToken(apiToken.value);
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

  cleanupProgramOptions(program) {
    program.options.map(option => {
      return option.long.substring(2);
    }).forEach(optionName => {
      if (typeof program[optionName] === 'function') {
        program[optionName] = undefined;
      }
    });
  }

  validateCommand() {
    return true;
  }

  validateOptionnalParams(program, optionnalParams) {
    return optionnalParams.reduce((valid, item) => {
      return valid && (!program[item] || (program[item] && program[item] !== true));
    }, true);
  }

  execute() {
    return Promise.reject('Need to be overridden');
  }

  render() {
    this.cleanupProgramOptions(program);
    if (this.validateCommand(program)) {
      const result = this.execute(program);
      if (program.json) {
        jsonRenderer(result);
      } else {
        prettyRenderer(result);
      }
    } else {
      this.error(program);
    }
  }

  error(program) {
    console.error('Mandatory arguments are missing or invalid.');
    program.help();
  }

}

module.exports = BarracksCommand;