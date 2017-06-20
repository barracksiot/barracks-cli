const Validator = require('../../utils/Validator');
const BarracksCommand = require('../BarracksCommand');

class UpdateFilterCommand extends BarracksCommand {

  configureCommand(program) {
    return program
    .option('--name [value]', 'The name of the filter')
    .option('--query [value]', 'The query expression in JSON');
  }

  validateCommand(program) {
    return !!(
      program.name && program.name !== true &&
      program.query && program.query !== true &&
      Validator.isJsonObject(program.query)
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.updateFilter(token, {
        name: program.name,
        query: JSON.parse(program.query)
      });
    });
  }
}

module.exports = UpdateFilterCommand;