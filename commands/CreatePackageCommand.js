const BarracksCommand = require('./BarracksCommand');

class CreateUpdateCommand extends BarracksCommand {

  configureCommand(program) {
    return program
      .option('--ref [value]', 'The unique reference of the package')
      .option('--name [value]', 'The name of the package')
      .option('--description [value]', '(Optionnal) The description of the pacakge');
  }

  validateCommand(program) {
    return !!(
      program.ref && program.ref !== true && 
      program.name && program.name !== true && 
      (!program.description || (program.description && program.description !== true))
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createPackage(token, {
        ref: program.ref,
        name: program.name,
        description: program.description
      });
    });
  }
}

module.exports = CreateUpdateCommand;
