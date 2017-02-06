const BarracksCommand = require('./BarracksCommand');

function isValidJson(json) {
  try {
    return !!JSON.parse(json);
  } catch (e) {
    return false;
  }
}

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
  const extractedOptions = extractOptions(program, ['id', 'name', 'query']);
  return Object.assign({}, extractedOptions, {
    query: JSON.parse(extractedOptions.query)
  });
}

class EditSegmentCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--id [segment id]', 'The ID of the segment')
      .option('--name [value]', '(Optionnal) The name of the segment')
      .option('--query [value]', '(Optionnal) The query expression in JSON');
  }

  validateCommand(program) {
    return !!(
      program.id && program.id !== true && 
      (
        !program.query || 
        (
          program.query !== true && 
          isValidJson(program.query)
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
