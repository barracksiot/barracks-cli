const BarracksCommand = require('./BarracksCommand');

class DeploymentPlanCommand extends BarracksCommand {
  validateCommand(program) {
    return !!(
        program.packageReference &&
        program.packageReference !== true &&
        typeof program.packageReference !== 'function'
    );
  }

  configureCommand(program) {
    return program
        .option('--packageReference [value]', 'The reference of the component to get the Deployment Plan from');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDeploymentPlan(token, program.packageReference);
    });
  }
}

module.exports = DeploymentPlanCommand;