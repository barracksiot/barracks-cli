const read = require('read');
const BarracksCommand = require('./BarracksCommand');

function validateAuthenticationOptions(program) {
  return program.username && program.username != true
    && program.password && program.password != true;
}

class LoginCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--email [email]', '(Optionnal) The e-mail of the account. Must be used with --password.')
      .option('--password [password]', '(Optionnal) The password of the account. Must be used with --email.');
  }

  execute(program) {
    return this.requestUserAuthentication().then(credentials => {
      return this.authenticate(credentials.email, credentials.password);
    }).then(() => {
      return Promise.resolve('Authentication successful');
    });
  }

}

module.exports = LoginCommand;