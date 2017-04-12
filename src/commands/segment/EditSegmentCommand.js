const Validator = require('../../utils/Validator');
const BarracksCommand = require('../BarracksCommand');

function extractOptions(program, fields) {
  const options = {};
  fields.forEach(field => {
    if (program[field] && program[field] !== true && typeof program[field] !== 'function') {
      options[field] = program[field];
    }
  });
  return options;
}

function buildSegmentDiff(program) {
  const extractedOptions = extractOptions(program, ['name', 'query']);
  if (extractedOptions.query) {
    extractedOptions.query = JSON.parse(extractedOptions.query);
  }
  return Object.assign({}, extractedOptions, { id: program.args[0] });
}

class EditSegmentCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<segment-id>', 'The ID of the segment')
      .option('--name [value]', '(Optionnal) The name of the segment')
      .option('--query [value]', '(Optionnal) The query expression in JSON');
  }

  validateCommand(program) {
    return !!(
      program.args[0] && program.args[0] !== true && 
      (
        !program.query || 
        (
          program.query !== true && 
          Validator.isJsonString(program.query)
        )
      )
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.editSegment(token, buildSegmentDiff(program));
    });
  }

}

module.exports = EditSegmentCommand;
