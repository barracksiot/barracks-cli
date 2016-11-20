const BarracksCommand = require('./BarracksCommand');

class UpdateCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getUpdates(token);
    });
  }

}

module.exports = UpdateCommand;