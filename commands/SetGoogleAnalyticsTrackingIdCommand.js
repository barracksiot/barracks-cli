const BarracksCommand = require('./BarracksCommand');

class SetGoogleAnalyticsTrackingIdCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .arguments('<ga-tracking-id>');
  }

  validateCommand(program) {
    return !!(program.args && program.args.length === 1 && program.args[0] !== true);
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.setGoogleAnalyticsTrackingId(token, program.args[0]);
    });
  }
}

module.exports = SetGoogleAnalyticsTrackingIdCommand;
