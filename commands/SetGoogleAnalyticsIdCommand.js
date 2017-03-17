const BarracksCommand = require('./BarracksCommand');

class SetGoogleAnalyticsIdCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<ga-id>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1 && program.args[0] !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.setGoogleAnalyticsId(token, program.args[0]);
    });
  }
}

module.exports = SetGoogleAnalyticsIdCommand;
