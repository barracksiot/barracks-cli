const BarracksCommand = require('../BarracksCommand');

class DeleteFilterCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<filter-name>');
  }

  validateCommand(program) {
    return !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.deleteFilter(token, program.args[0]);
    });
  }
}

module.exports = DeleteFilterCommand;