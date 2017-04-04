const BarracksCommand = require('./BarracksCommand');

class CreateTokenCommand extends BarracksCommand {

  configureCommand(program) {
    return program.option('--label [value]', 'The label of the token');
  }

  validateCommand(program) {
    return !!(
      program.label &&
      program.label !== true
    );
  }

  execute(program) {
    return this.getAuthenticationToken().then(token => {
      return this.barracks.createToken(token, { label: program.label });
    });
  }
}

module.exports = CreateTokenCommand;
