const BarracksCommand = require('./BarracksCommand');

class UpdatesCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--segment [segmentId]', '(Optionnal) A segment id to filter the list of updates');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      if (program && program.segment) {
        return this.barracks.getUpdatesBySegment(token, program.segment);
      } else {
        return this.barracks.getUpdates(token);
      }
    });
  }

}

module.exports = UpdatesCommand;