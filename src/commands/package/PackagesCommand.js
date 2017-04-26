const BarracksCommand = require('../BarracksCommand');

class PackagesCommand extends BarracksCommand {

  configureCommand(program) {
    return program;
  }

  execute() {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getPackages(token);
    });
  }
}

module.exports = PackagesCommand;
