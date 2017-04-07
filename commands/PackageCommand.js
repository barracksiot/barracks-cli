const BarracksCommand = require('./BarracksCommand');

class PackageCommand extends BarracksCommand {

  validateCommand(program) {
    return !!(
        program.packageReference &&
            program.packageReference !== true &&
            typeof program.packageReference !== 'function'
    );
  }

  configureCommand(program) {
    return program
        .option('--packageReference [value]', 'The reference of the package');
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.getPackage(token, program.packageReference);
    });
  }
}

module.exports = PackageCommand;