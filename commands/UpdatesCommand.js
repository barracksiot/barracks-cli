const BarracksCommand = require('./BarracksCommand');

class UpdatesCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getUpdates(token);
    });
  }

}

module.exports = UpdatesCommand;