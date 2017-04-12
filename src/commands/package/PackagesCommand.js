const BarracksCommand = require('../BarracksCommand');

class PackagesCommand extends BarracksCommand {

  configureCommand(program) {
    return program;
  }

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getComponents(token);
    });
  }
}

module.exports = PackagesCommand;
