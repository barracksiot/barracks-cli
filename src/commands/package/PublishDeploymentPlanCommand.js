const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const ObjectReader = require('../../utils/ObjectReader');

function getObject(program) {
  if (program.file) {
    return ObjectReader.readObjectFromFile(program.file);
  } else {
    return ObjectReader.readObjectFromStdin();
  }
}
class PublishDeploymentPlanCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--file [path/to/file]', 'The path to the file containing the JSON describing the deployment plan. If not specified, the command will expect a stream containing the deploiement plan');
  }

  validateCommand(program) {
    return !!(!program.file || Validator.fileExists(program.file));
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return getObject(program);
    }).then(plan => {
      if (plan.package) {
        return this.barracks.publishDeploymentPlan(token, plan);
      } else {
        return false;
      }
    });
  }
}

module.exports = PublishDeploymentPlanCommand;
