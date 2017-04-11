const BarracksCommand = require('./BarracksCommand');

class PackageVersionsCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--packageReference [value]', 'The reference of the package to get the versions from');
  }

  validateCommand(program) {
    return !!(
      program.packageReference &&
      program.packageReference !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getComponentVersions(token, program.packageReference);
    });
  }
}

module.exports = PackageVersionsCommand;