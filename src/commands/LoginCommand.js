const BarracksCommand = require('./BarracksCommand');
const os = require('os');

const TOKEN_LABEL_MAX_LENGTH = 50;

function loginOptionsGiven(program) {
  return program.email && program.email !== true && 
      program.password && program.password !== true;
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

function buildTokenLabel() {
  // max 50 char;
  const hostname = os.hostname();
  const user = os.userInfo().username;
  return `${user}@${hostname}`.substring(0, TOKEN_LABEL_MAX_LENGTH);
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
    }).then(authToken => {
      return this.barracks.createToken(authToken, { label: buildTokenLabel() });
    }).then(apiToken => {
      return this.saveAuthenticationToken(apiToken.value);
    }).then(() => {
      return Promise.resolve('Authentication successful');
    });
  }
}

module.exports = LoginCommand;