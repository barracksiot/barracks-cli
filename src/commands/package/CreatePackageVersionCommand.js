const Validator = require('../../utils/Validator');
const BarracksCommand = require('../BarracksCommand');

class CreatePackageVersionCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--versionId [value]', 'The id of the version')
      .option('--name [value]', 'The name of the version')
      .option('--packageReference [value]', 'The reference for which existing package you want to create the version')
      .option('--file [file]', 'The path to the package of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--metadata [json]', '(Optionnal) The metadata you want to associate with the update (must be a valid JSON)'); 
  }

  validateCommand(program) {
    return !!(
      program.versionId && program.versionId !== true && 
      program.name && program.name !== true && 
      program.packageReference && program.packageReference !== true && 
      program.file && Validator.fileExists(program.file) && 
      (!program.description || (program.description  && program.description !== true)) &&
      (!program.metadata || Validator.isJsonObject(program.metadata))
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createVersion(token, {
        id: program.versionId,
        name: program.name,
        component: program.packageReference,
        file: program.file,
        description: program.description,
        metadata: program.metadata ? JSON.parse(program.metadata) : undefined
      });
    });
  }
}

module.exports = CreatePackageVersionCommand;
