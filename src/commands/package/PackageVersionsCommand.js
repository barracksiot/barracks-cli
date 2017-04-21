const BarracksCommand = require('../BarracksCommand');

class PackageVersionsCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<package-reference>');
  }

  validateCommand(program) {
    return !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getPackageVersions(token, program.args[0]);
    });
  }
}

module.exports = PackageVersionsCommand;
