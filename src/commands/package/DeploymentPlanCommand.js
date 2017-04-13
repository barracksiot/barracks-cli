const BarracksCommand = require('../BarracksCommand');

class DeploymentPlanCommand extends BarracksCommand {

  validateCommand(program) {
    return !!program.args[0];
  }

  configureCommand(program) {
    return program.arguments('<package-reference>');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getDeploymentPlan(token, program.args[0]);
    });
  }
}

module.exports = DeploymentPlanCommand;