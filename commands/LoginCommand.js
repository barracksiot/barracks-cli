const read = require('read');
const BarracksCommand = require('./BarracksCommand');

class LoginCommand extends BarracksCommand {

  execute() {
    return new Promise((resolve, reject) => {
      read({ prompt: 'E-mail: ' }, (err, email) => {
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
    }).then(credentials => {
      return this.barracks.authenticate(credentials.email, credentials.password)
    }).then(token => {
      return this.saveAuthenticationToken(token);
    }).then(() => {
      console.log('Authentication successful');
    });
  }

}

module.exports = LoginCommand;