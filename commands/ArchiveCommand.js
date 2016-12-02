const BarracksCommand = require('./BarracksCommand');

class ArchiveCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<update-uuid>');
  }

  validateCommand(program) {
    return !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.archiveUpdate(token, program.args[0]);
    });
  }

}

module.exports = ArchiveCommand;