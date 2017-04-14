const BarracksCommand = require('../BarracksCommand');

class FilterCommand extends BarracksCommand {

  configureCommand(program) {
    return program
    .arguments('<filter-name>')
    .option('');
  }

  validateCommand(program) {
    const hasFilterName = !!(program.args && program.args.length === 1 && program.args[0] !== true);
    return hasFilterName;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getFilterByName(token, program.args[0]);
    });
  }
}

module.exports = FilterCommand;