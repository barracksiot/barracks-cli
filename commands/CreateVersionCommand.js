const Validator = require('../utils/Validator');
const BarracksCommand = require('./BarracksCommand');

class CreateVersionCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--packageName [value]', 'The package name for which you want to create the version')
      .option('--file [file]', 'The path to the package of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--metadata [json]', '(Optionnal) The metadata you want to associate with the update (must be a valid JSON)'); 
  }

  validateCommand(program) {
    return !!(
      program.packageName && program.packageName !== true && 
      program.file && Validator.fileExists(program.file) && 
      (!program.description || (program.description  && program.description !== true)) &&
      (!program.metadata || Validator.isJsonString(program.metadata))
    );
  }

  execute(program) {
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return this.barracks.getComponentByName(token, program.packageName);
    }).then(component => {
      return this.barracks.createVersion(token, {
        component: component.id,
        file: program.file,
        description: program.description,
        metadata: program.metadata
      });
    });
  }
}

module.exports = CreateVersionCommand;
