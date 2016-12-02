const read = require('read');
const BarracksCommand = require('./BarracksCommand');

function loginOptionsGiven(program) {
  return program.email && program.email != true
    && program.password && program.password != true;
}

function getCredentials(loginCommand, program) {
  if (loginOptionsGiven(program)) {
    return Promise.resolve({ 
      email: program.email,
      password: program.password
    });
  }
  return loginCommand.requestUserAuthentication();
}

class LoginCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--email [email]', '(Optionnal) The e-mail of the account. Must be used with --password.')
      .option('--password [password]', '(Optionnal) The password of the account. Must be used with --email.');
  }

  execute(program) {
    return getCredentials(this, program).then(credentials => {
      return this.authenticate(credentials.email, credentials.password);
    }).then(() => {
      return Promise.resolve('Authentication successful');
    });
  }
}

module.exports = LoginCommand;