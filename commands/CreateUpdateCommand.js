const fs = require('fs');
const BarracksCommand = require('./BarracksCommand');

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function fileExists(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
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

  validateCommand(program) {
    return !!(program.title && program.title != true
      && program.channel && program.channel != true
      && program.versionId && program.versionId != true
      && program.package && fileExists(program.package)
      && (!program.properties || isJsonString(program.properties)));
  }

  execute(program) {
    let channel;
    let token;
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
        additionalProperties: JSON.parse(program.properties || '{}'),
        packageId: createdPackage.id
      });
    });
  }

}

module.exports = CreateUpdateCommand;
