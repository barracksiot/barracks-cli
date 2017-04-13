const BarracksCommand = require('../BarracksCommand');

class PackageVersionsCommand extends BarracksCommand {

  configureCommand(program) {
      .arguments('<package-reference>')
      .arguments('<version-id>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 2);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getComponentVersion(token, program.args[0], program.args[1]);
    });
  }
}

module.exports = PackageVersionsCommand;