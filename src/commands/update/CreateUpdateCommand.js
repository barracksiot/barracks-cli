const Validator = require('../../utils/Validator');
const BarracksCommand = require('../BarracksCommand');

class CreateUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--title [value]', 'The title of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--segment [name]', 'The segment for which you want to create the update')
      .option('--versionId [versionId]', 'The ID of the version of the update')
      .option('--package [file]', 'The path to the package of the update')
      .option('--properties [json]', '(Optionnal) The custom data you want to associate with the update (must be a valid JSON)');
  }

  validateCommand(program) {
    return !!(
      program.title && program.title !== true && 
      program.segment && program.segment !== true && 
      program.versionId && program.versionId !== true && 
      program.package && Validator.fileExists(program.package) && 
      (!program.properties || Validator.isJsonString(program.properties))
    );
  }

  execute(program) {
    let segment;
    let token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return this.barracks.getSegmentByName(token, program.segment);
    }).then(result => {
      segment = result;
      return this.barracks.createUpdatePackage(token, {
        versionId: program.versionId,
        file: program.package
      });
    }).then(createdPackage => {
      return this.barracks.createUpdate(token, {
        name: program.title,
        description: program.description,
        segmentId: segment.id,
        additionalProperties: JSON.parse(program.properties || '{}'),
        packageId: createdPackage.id
      });
    });
  }

}

module.exports = CreateUpdateCommand;
