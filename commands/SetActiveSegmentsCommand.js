const BarracksCommand = require('./BarracksCommand');

class SetActiveSegmentsCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('[segment_ids...]')
      .option('--empty', 'Empty the list of active segments / Disable all segments')
      .description('IDs should be in priority order.');
  }

  validateCommand(program) {
    return program.args.length > 0 || program.empty;
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.setActiveSegments(token, program.args);
    });
  }
}

module.exports = SetActiveSegmentsCommand;
