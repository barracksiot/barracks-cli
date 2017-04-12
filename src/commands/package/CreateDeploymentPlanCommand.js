const BarracksCommand = require('../BarracksCommand');
const Validator = require('../../utils/Validator');
const inStream = require('in-stream');
const fs = require('fs');

function getDeploymentPlanFromString(data) {
  return new Promise((resolve, reject) => {
    if (Validator.isJsonString(data)) {
      const plan = JSON.parse(data);
      if (plan.package) {
        resolve(plan);
      } else {
        reject('Missing mandatory attribute "package" in deployment plan');
      }
    } else {
      reject('Deployment plan must be described by a valid JSON');
    }
  });
}

function readDeploymentPlanFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      getDeploymentPlanFromString(data).then(plan => {
        resolve(plan);
      }).catch(err => {
        reject(err);
      });
    });
  });
}

function readDeploymentPlanFromStdin() {
  return new Promise((resolve, reject) => {
    let streamContent = '';

    inStream.on('data', chunk => {
      streamContent += chunk.toString('utf8');
    });

    inStream.on('close', () => {
      getDeploymentPlanFromString(streamContent).then(plan => {
        resolve(plan);
      }).catch(err => {
        reject(err);
      });
    });

    inStream.on('error', error => {
      reject(error);
    });
  });
}

function getDeploymentPlan(program) {
  if (program.file) {
    return readDeploymentPlanFromFile(program.file);
  } else {
    return readDeploymentPlanFromStdin();
  }
}

class CreateDeploymentPlanCommand extends BarracksCommand {

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
      return getDeploymentPlan(program);
    }).then(plan => {
      return this.barracks.createDeploymentPlan(token, plan);
    });
  }
}

module.exports = CreateDeploymentPlanCommand;
