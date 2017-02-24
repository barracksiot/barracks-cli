const BarracksCommand = require('./BarracksCommand');

function isValidJson(json) {
  try {
    return !!JSON.parse(json);
  } catch (e) {
    return false;
  }
}

class CreateSegmentCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--name [value]', 'The name of the segment')
      .option('--query [value]', 'The query expression in JSON');
  }

  validateCommand(program) {
    return !!(
      program.name && program.name !== true && typeof program.name !== 'function' &&
      program.query && program.query !== true && 
      isValidJson(program.query)
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createSegment(token, {
        name: program.name,
        query: JSON.parse(program.query)
      });
    });
  }
}

module.exports = CreateSegmentCommand;
