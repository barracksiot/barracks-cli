const BarracksCommand = require('../BarracksCommand');

class CreatePackageCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--reference [value]', 'The unique reference of the package')
      .option('--name [value]', 'The name of the package')
      .option('--description [value]', '(Optionnal) The description of the package');
  }

  validateCommand(program) {
    return !!(
      program.reference && program.reference !== true && 
      program.name && program.name !== true &&
      (!program.description || (program.description && program.description !== true))
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createPackage(token, {
        reference: program.reference,
        name: program.name,
        description: program.description
      });
    });
  }
}

module.exports = CreatePackageCommand;
