const BarracksCommand = require('../BarracksCommand');

class PublishCommand extends BarracksCommand {

  configureCommand(program) {
    return program.arguments('<update-uuid>');
  }

  validateCommand(program) {
    return !!program.args && !!program.args[0];
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.publishUpdate(token, program.args[0]);
    });
  }

}

module.exports = PublishCommand;