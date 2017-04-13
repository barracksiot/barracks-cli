const BarracksCommand = require('../BarracksCommand');

class PackageCommand extends BarracksCommand {

  validateCommand(program) {
    return !!program.args[0];
  }

  configureCommand(program) {
    return program.arguments('<package-reference>');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getPackage(token, program.args[0]);
    });
  }
}

module.exports = PackageCommand;