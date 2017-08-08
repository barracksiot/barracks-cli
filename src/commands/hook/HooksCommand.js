const BarracksCommand = require('../BarracksCommand');

class HooksCommand extends BarracksCommand {

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getHooks(token);
    });
  }
}

module.exports = HooksCommand;
