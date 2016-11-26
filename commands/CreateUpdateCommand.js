const BarracksCommand = require('./BarracksCommand');

function validateMandatoryOptions(program) {
  return program.title && program.title != true
    && program.channel && program.channel != true
    && program.versionId && program.versionId != true
    && program.package && program.package != true;
}

class CreateUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--title [value]', 'The title of the update')
      .option('--description [value]', '(Optionnal) The description of the update')
      .option('--channel [name]', 'The channel for which you want to create the update')
      .option('--versionId [versionId]', 'The ID of the version of the update')
      .option('--package [file]', 'The path to the package of the update')
      .option('--properties [json]', '(Optionnal) The custom data you want to associate with the update (must be a valid JSON)');
  }

  execute(program) {
    if (!validateMandatoryOptions(program)) {
      return Promise.reject('Mandatory arguments are missing. You can use the help command for more information.');
    }
    var channel;
    var token;
    return this.getAuthenticationToken().then(authToken => {
      token = authToken;
      return this.barracks.getChannelByName(token, program.channel);
    }).then(result => {
      channel = result;
      return this.barracks.createPackage(token, {
        versionId: program.versionId,
        file: program.package
      });
    }).then(createdPackage => {
      return this.barracks.createUpdate(token, {
        name: program.title,
        description: program.description,
        channelId: channel.id,
        additionalProperties: program.properties,
        packageId: createdPackage.id
      });
    });
  }

}

module.exports = CreateUpdateCommand;
