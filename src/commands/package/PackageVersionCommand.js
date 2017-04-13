const BarracksCommand = require('../BarracksCommand');

class PackageVersionCommand extends BarracksCommand {

  validateCommand(program) {
    return !!(program.args && program.args.length === 2);
  }

  configureCommand(program) {
    return program.arguments('<package-reference>')
      .arguments('<version-id>');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getVersion(token, program.args[0], program.args[1]);
    });
  }
}

module.exports = PackageVersionCommand;