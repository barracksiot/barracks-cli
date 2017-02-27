const Validator = require('../utils/Validator');
const BarracksCommand = require('./BarracksCommand');

class CreateFilterCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--name [value]', 'The name of the filter')
      .option('--query [value]', 'The query expression in JSON');
  }

  validateCommand(program) {
    return !!(
      program.name && program.name !== true && typeof program.name !== 'function' &&
      program.query && program.query !== true && 
      Validator.isJsonString(program.query)
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createFilter(token, {
        name: program.name,
        query: JSON.parse(program.query)
      });
    });
  }
}

module.exports = CreateFilterCommand;
