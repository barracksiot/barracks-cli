const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const ObjectReader = require('../../utils/ObjectReader');

function getObject(program) {
  if (program.file) {
    return ObjectReader.readObjectFromFile(program.file);
  } else {
    return ObjectReader.readObjectFromStdin();
  }
}

class SetGoogleClientSecretCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--file [path/to/file]', 'The path to the file containing the JSON describing the client secret.')
  }

  validateCommand(program) {
    return !!(!program.file || Validator.fileExists(program.file));
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return getObject(program);
    }).then(secret => {
      return this.barracks.setGoogleClientSecret(token, secret);
    });
  }
}

module.exports = SetGoogleClientSecretCommand;