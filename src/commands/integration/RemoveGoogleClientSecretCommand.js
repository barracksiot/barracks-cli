const BarracksCommand = require('../BarracksCommand');

class RemoveGoogleClientSecretCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.removeGoogleClientSecret(token);
    });
  }
}

module.exports = RemoveGoogleClientSecretCommand;