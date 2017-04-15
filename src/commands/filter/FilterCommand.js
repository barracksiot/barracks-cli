const BarracksCommand = require('../BarracksCommand');

class FilterCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<filter-name>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1 && program.args[0] !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getFilter(token, program.args[0]);
    });
  }
}

module.exports = FilterCommand;