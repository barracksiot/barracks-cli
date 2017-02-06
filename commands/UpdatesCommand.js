const BarracksCommand = require('./BarracksCommand');

class UpdatesCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--segment [name]', '(Optionnal) Filter by segment name');
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      if (program && program.segment) {
        return this.barracks.getSegmentByName(token, program.segment);
      } else {
        return Promise.resolve();
      }
    }).then(segment => {
      if (segment) {
        return this.barracks.getUpdatesBySegmentId(token, segment.id);
      } else {
        return this.barracks.getUpdates(token);
      }
    });
  }
}

module.exports = UpdatesCommand;