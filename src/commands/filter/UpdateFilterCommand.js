const Validator = require('../../utils/Validator');
const BarracksCommand = require('../BarracksCommand');
const yesno = require('yesno');

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
      return this.barracks.getFilter(token, program.name).then(filter => {
        const that = this;
        if (filter.deviceCount !== 0) {
          yesno.ask('WARNING: Your filter is already being used by ' + filter.deviceCount + ' device(s). Do you want to continue ? (y/n)', true, function(ok) {
            if(ok) {
              return that.barracks.updateFilter(token, {
                name: program.name,
                query: JSON.parse(program.query)
              });
            } else {
              console.log("Aborted.");
            }
          }, ['y'], ['n']);
        } else {
          return this.barracks.updateFilter(token, {
            name: program.name,
            query: JSON.parse(program.query)
          });
        }
      });
    });
  }
}

module.exports = UpdateFilterCommand;