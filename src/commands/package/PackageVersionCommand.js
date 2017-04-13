const BarracksCommand = require('../BarracksCommand');

class PackageVersionCommand extends BarracksCommand {

  validateCommand(program) {
    return !!(
        program.packageReference &&
        program.packageReference !== true &&
        program.versionId &&
        program.versionId !== true
    );
  }

  configureCommand(program) {
    return program
        .option('--packageReference [value]', 'The reference of the package to get the version from')
        .option('--versionId [value]', 'Id of the version to fetch');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getPackageVersion(token, program.packageReference, program.versionId);
    });
  }
}

module.exports = PackageVersionCommand;